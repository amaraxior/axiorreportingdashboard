#!/usr/bin/env node

import {
  AmplifyClient,
  UpdateAppCommand,
  CreateDeploymentCommand,
  StartDeploymentCommand,
} from '@aws-sdk/client-amplify';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import archiver from 'archiver';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const config = {
  appId: 'd3u4dfhazkuehe',
  branch: 'main',
  region: 'us-east-1',
  accessKeyId: process.env.ADMIN_CLI_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.ADMIN_CLI_AWS_SECRET_ACCESS_KEY,
};

const amplifyClient = new AmplifyClient({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId!,
    secretAccessKey: config.secretAccessKey!,
  },
});

const buildSpec = `version: 1
applications:
  - appRoot: .
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
`;

async function switchToLambda() {
  console.log('🔧 Configuring app for Lambda (WEB_COMPUTE)...');

  try {
    await amplifyClient.send(
      new UpdateAppCommand({
        appId: config.appId,
        platform: 'WEB_COMPUTE',
        buildSpec: buildSpec,
      })
    );
    console.log('✅ App configured for Lambda with build spec');
  } catch (error: any) {
    console.error('⚠️  Warning:', error.message);
  }
}

async function createSourceArchive(): Promise<string> {
  console.log('\n📦 Creating source code archive...');

  const outputPath = path.join(process.cwd(), 'deploy-source.zip');
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`✅ Archive created (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
      resolve(outputPath);
    });

    archive.on('error', reject);
    archive.pipe(output);

    // Include source code files (not built files)
    const filesToInclude = [
      'app',
      'components',
      'data',
      'lib',
      'public',
      'scripts',
      'package.json',
      'package-lock.json',
      'next.config.ts',
      'tsconfig.json',
      'tailwind.config.ts',
      'postcss.config.mjs',
      'middleware.ts',
      '.env.local',
    ];

    filesToInclude.forEach((item) => {
      const itemPath = path.join(process.cwd(), item);
      if (fs.existsSync(itemPath)) {
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          archive.directory(itemPath, item);
        } else {
          archive.file(itemPath, { name: item });
        }
      }
    });

    archive.finalize();
  });
}

async function uploadAndDeploy(zipPath: string): Promise<void> {
  console.log('\n📝 Creating deployment record...');

  const createResult = await amplifyClient.send(
    new CreateDeploymentCommand({
      appId: config.appId,
      branchName: config.branch,
    })
  );

  if (!createResult.zipUploadUrl) {
    throw new Error('No upload URL received');
  }

  console.log('✅ Deployment record created');
  console.log('\n⬆️  Uploading source code to S3...');

  const fileContent = fs.readFileSync(zipPath);
  const response = await fetch(createResult.zipUploadUrl, {
    method: 'PUT',
    body: fileContent,
    headers: {
      'Content-Type': 'application/zip',
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  console.log('✅ Upload complete');
  console.log('\n🚀 Starting Lambda deployment...');
  console.log('   AWS will build and deploy your app with SSR...');

  await amplifyClient.send(
    new StartDeploymentCommand({
      appId: config.appId,
      branchName: config.branch,
      jobId: createResult.jobId,
    })
  );

  console.log(`✅ Build job started! Job ID: ${createResult.jobId}`);
}

async function deploy() {
  console.log('🚀 Starting Lambda Deployment...\n');

  try {
    // Step 1: Configure for Lambda
    await switchToLambda();

    // Step 2: Create source archive
    const zipPath = await createSourceArchive();

    // Step 3: Upload and deploy
    await uploadAndDeploy(zipPath);

    // Clean up
    fs.unlinkSync(zipPath);
    console.log('\n🗑️  Cleaned up temporary files');

    // Output results
    console.log('\n' + '='.repeat(80));
    console.log('✅ Deployment Initiated!\n');
    console.log('⏳ AWS is building your Lambda app (this takes 2-5 minutes)...');
    console.log('\n🌐 Your app will be available at:');
    console.log(`  https://main.${config.appId}.amplifyapp.com`);
    console.log(`  https://axiorreporting.axior.dev`);
    console.log('\n📊 Monitor build progress:');
    console.log(`  https://console.aws.amazon.com/amplify/home?region=${config.region}#/${config.appId}/main`);
    console.log('\n💡 Run "npx tsx scripts/check-status.ts" to check deployment status');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
