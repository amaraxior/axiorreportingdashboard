#!/usr/bin/env node

/**
 * Axior Dashboard AWS Amplify Deployment Script
 *
 * This script deploys the Next.js SSR dashboard to AWS Lambda via Amplify
 *
 * Usage:
 *   npm run deploy:aws
 *   tsx scripts/deploy.ts
 */

import {
  AmplifyClient,
  CreateAppCommand,
  CreateBranchCommand,
  CreateDomainAssociationCommand,
  ListAppsCommand,
  StartJobCommand,
  UpdateAppCommand,
  GetAppCommand
} from '@aws-sdk/client-amplify';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env.local');
} else {
  console.log('⚠️  No .env.local found, using process.env');
}

// Configuration
const config = {
  appName: process.env.AMPLIFY_APP_NAME || 'axiorreporting-dashboard',
  repository: process.env.REPOSITORY_URL || 'https://github.com/amaraxior/axiorreportingdashboard',
  branch: process.env.BRANCH || 'main',
  customDomain: process.env.CUSTOM_DOMAIN || 'axiorreporting.axior.dev',
  region: process.env.AWS_REGION || 'us-east-1',

  // AWS Credentials
  accessKeyId: process.env.ADMIN_CLI_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.ADMIN_CLI_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,

  // Clerk Environment Variables
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
};

// Validate configuration
if (!config.accessKeyId || !config.secretAccessKey) {
  console.error('❌ Error: AWS credentials not found in environment variables');
  console.error('   Required: ADMIN_CLI_AWS_ACCESS_KEY_ID and ADMIN_CLI_AWS_SECRET_ACCESS_KEY');
  process.exit(1);
}

if (!config.clerkPublishableKey || !config.clerkSecretKey) {
  console.warn('⚠️  Warning: Clerk credentials not found. Authentication may not work.');
}

// Initialize AWS Amplify client
const amplifyClient = new AmplifyClient({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

interface AppInfo {
  appId: string;
  defaultDomain: string;
}

/**
 * Find existing Amplify app by name
 */
async function findExistingApp(): Promise<AppInfo | null> {
  try {
    const response = await amplifyClient.send(new ListAppsCommand({}));
    const app = response.apps?.find((a) => a.name === config.appName);

    if (app && app.appId && app.defaultDomain) {
      return {
        appId: app.appId,
        defaultDomain: app.defaultDomain,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error listing apps:', error);
    throw error;
  }
}

/**
 * Create new Amplify app
 */
async function createApp(): Promise<AppInfo> {
  console.log('📦 Creating new Amplify app...');

  try {
    const response = await amplifyClient.send(
      new CreateAppCommand({
        name: config.appName,
        repository: config.repository,
        platform: 'WEB_COMPUTE',
        environmentVariables: {
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: config.clerkPublishableKey || '',
          CLERK_SECRET_KEY: config.clerkSecretKey || '',
        },
      })
    );

    if (!response.app?.appId || !response.app?.defaultDomain) {
      throw new Error('Failed to create app: missing appId or defaultDomain');
    }

    console.log(`✅ Created Amplify app with ID: ${response.app.appId}`);

    return {
      appId: response.app.appId,
      defaultDomain: response.app.defaultDomain,
    };
  } catch (error) {
    console.error('❌ Error creating app:', error);
    throw error;
  }
}

/**
 * Create branch in Amplify app
 */
async function createBranch(appId: string): Promise<void> {
  console.log('🌿 Creating branch connection...');

  try {
    await amplifyClient.send(
      new CreateBranchCommand({
        appId,
        branchName: config.branch,
        enableAutoBuild: true,
      })
    );
    console.log('✅ Branch created');
  } catch (error: any) {
    if (error.name === 'DependentServiceFailureException' || error.message?.includes('already exists')) {
      console.log('⚠️  Branch already exists, skipping creation');
    } else {
      console.error('❌ Error creating branch:', error);
      throw error;
    }
  }
}

/**
 * Configure custom domain
 */
async function configureDomain(appId: string): Promise<void> {
  console.log('🌐 Configuring custom domain...');

  const domainParts = config.customDomain.split('.');
  const rootDomain = domainParts.slice(-2).join('.');
  const subdomain = domainParts.slice(0, -2).join('.');

  try {
    await amplifyClient.send(
      new CreateDomainAssociationCommand({
        appId,
        domainName: rootDomain,
        subDomainSettings: [
          {
            prefix: subdomain,
            branchName: config.branch,
          },
        ],
      })
    );
    console.log('✅ Domain configured');
  } catch (error: any) {
    if (error.name === 'DependentServiceFailureException' || error.message?.includes('already exists')) {
      console.log('⚠️  Domain already configured, skipping');
    } else {
      console.warn('⚠️  Domain configuration will need manual setup');
      console.warn(`   Error: ${error.message}`);
    }
  }
}

/**
 * Trigger deployment
 */
async function triggerDeployment(appId: string): Promise<string> {
  console.log('🚀 Triggering deployment...');

  try {
    const response = await amplifyClient.send(
      new StartJobCommand({
        appId,
        branchName: config.branch,
        jobType: 'RELEASE',
      })
    );

    if (!response.jobSummary?.jobId) {
      throw new Error('Failed to start job: missing jobId');
    }

    console.log(`✅ Deployment triggered! Job ID: ${response.jobSummary.jobId}`);
    return response.jobSummary.jobId;
  } catch (error) {
    console.error('❌ Error triggering deployment:', error);
    throw error;
  }
}

/**
 * Main deployment function
 */
async function deploy(): Promise<void> {
  console.log('🚀 Starting AWS Amplify Deployment...\n');

  console.log('📋 Configuration:');
  console.log(`  App Name: ${config.appName}`);
  console.log(`  Repository: ${config.repository}`);
  console.log(`  Branch: ${config.branch}`);
  console.log(`  Region: ${config.region}`);
  console.log(`  Custom Domain: ${config.customDomain}\n`);

  try {
    // Check if app exists
    console.log('🔍 Checking if Amplify app exists...');
    let appInfo = await findExistingApp();

    if (!appInfo) {
      // Create new app
      appInfo = await createApp();

      // Create branch
      await createBranch(appInfo.appId);

      // Configure domain
      await configureDomain(appInfo.appId);
    } else {
      console.log(`✅ Found existing Amplify app with ID: ${appInfo.appId}`);
    }

    // Trigger deployment
    const jobId = await triggerDeployment(appInfo.appId);

    // Output results
    console.log('\n' + '='.repeat(80));
    console.log('✅ Deployment Complete!\n');
    console.log('📊 Monitor deployment at:');
    console.log(`  https://console.aws.amazon.com/amplify/home?region=${config.region}#/${appInfo.appId}/${config.branch}/${jobId}\n`);
    console.log('🌐 Your app will be available at:');
    console.log(`  https://${config.branch}.${appInfo.appId}.amplifyapp.com`);
    console.log(`  https://${config.customDomain} (after DNS configuration)\n`);
    console.log('📝 DNS Configuration Required:');
    console.log('  Add this Route53 CNAME record:');
    console.log(`  Name: ${config.customDomain}`);
    console.log(`  Value: ${config.branch}.${appInfo.appId}.amplifyapp.com`);
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploy();
