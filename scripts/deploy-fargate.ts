#!/usr/bin/env node

import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const config = {
  awsRegion: 'us-east-1',
  awsAccountId: '501000277888',
  ecrRepo: 'axiorreporting-dashboard',
  clusterName: 'axior-preview-cluster',
  serviceName: 'axiorreporting-dashboard',
  taskFamily: 'axiorreporting-dashboard-task',
  executionRoleArn: 'arn:aws:iam::501000277888:role/axior-fargate-execution-role',
  taskRoleArn: 'arn:aws:iam::501000277888:role/axior-fargate-task-role',
  subnets: ['subnet-0d00b7ea291485b96', 'subnet-086233e66d3d4c105'],
  securityGroups: ['sg-0f0fa6527f51dda51'],
};

function run(command: string, description: string) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} complete`);
  } catch (error) {
    console.error(`❌ ${description} failed`);
    process.exit(1);
  }
}

async function deploy() {
  console.log('🚀 Starting Fargate Deployment...\n');

  const imageTag = `${config.awsAccountId}.dkr.ecr.${config.awsRegion}.amazonaws.com/${config.ecrRepo}:latest`;

  // Step 1: Build Docker image
  run(
    `docker build -t ${config.ecrRepo} .`,
    'Building Docker image'
  );

  // Step 2: Tag image
  run(
    `docker tag ${config.ecrRepo}:latest ${imageTag}`,
    'Tagging image'
  );

  // Step 3: Login to ECR
  run(
    `aws ecr get-login-password --region ${config.awsRegion} | docker login --username AWS --password-stdin ${config.awsAccountId}.dkr.ecr.${config.awsRegion}.amazonaws.com`,
    'Logging in to ECR'
  );

  // Step 4: Create ECR repository if it doesn't exist
  try {
    execSync(`aws ecr describe-repositories --repository-names ${config.ecrRepo} --region ${config.awsRegion}`, { stdio: 'ignore' });
    console.log('\n✅ ECR repository exists');
  } catch {
    console.log('\n🔄 Creating ECR repository...');
    execSync(`aws ecr create-repository --repository-name ${config.ecrRepo} --region ${config.awsRegion}`, { stdio: 'inherit' });
    console.log('✅ ECR repository created');
  }

  // Step 5: Push image to ECR
  run(
    `docker push ${imageTag}`,
    'Pushing image to ECR'
  );

  // Step 6: Create task definition
  const taskDef = {
    family: config.taskFamily,
    networkMode: 'awsvpc',
    requiresCompatibilities: ['FARGATE'],
    cpu: '512',
    memory: '1024',
    executionRoleArn: config.executionRoleArn,
    taskRoleArn: config.taskRoleArn,
    containerDefinitions: [
      {
        name: config.serviceName,
        image: imageTag,
        essential: true,
        portMappings: [
          {
            containerPort: 3000,
            protocol: 'tcp',
          },
        ],
        environment: [
          { name: 'NODE_ENV', value: 'production' },
          { name: 'PORT', value: '3000' },
          { name: 'HOSTNAME', value: '0.0.0.0' },
          { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '' },
          { name: 'CLERK_SECRET_KEY', value: process.env.CLERK_SECRET_KEY || '' },
          { name: 'NEXT_PUBLIC_CLERK_SIGN_IN_URL', value: '/sign-in' },
          { name: 'NEXT_PUBLIC_CLERK_SIGN_UP_URL', value: '/sign-up' },
          { name: 'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL', value: '/' },
          { name: 'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL', value: '/' },
        ],
        logConfiguration: {
          logDriver: 'awslogs',
          options: {
            'awslogs-group': `/ecs/${config.taskFamily}`,
            'awslogs-region': config.awsRegion,
            'awslogs-stream-prefix': 'ecs',
            'awslogs-create-group': 'true',
          },
        },
      },
    ],
  };

  fs.writeFileSync('task-definition.json', JSON.stringify(taskDef, null, 2));
  console.log('\n✅ Task definition created');

  // Step 7: Register task definition
  run(
    `aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${config.awsRegion}`,
    'Registering task definition'
  );

  // Step 8: Check if service exists
  let serviceExists = false;
  try {
    execSync(
      `aws ecs describe-services --cluster ${config.clusterName} --services ${config.serviceName} --region ${config.awsRegion}`,
      { stdio: 'ignore' }
    );
    serviceExists = true;
  } catch {
    serviceExists = false;
  }

  if (serviceExists) {
    // Update existing service
    run(
      `aws ecs update-service --cluster ${config.clusterName} --service ${config.serviceName} --task-definition ${config.taskFamily} --force-new-deployment --region ${config.awsRegion}`,
      'Updating service'
    );
  } else {
    // Create new service
    const createServiceCmd = `aws ecs create-service \\
      --cluster ${config.clusterName} \\
      --service-name ${config.serviceName} \\
      --task-definition ${config.taskFamily} \\
      --desired-count 1 \\
      --launch-type FARGATE \\
      --network-configuration "awsvpcConfiguration={subnets=[${config.subnets.join(',')}],securityGroups=[${config.securityGroups.join(',')}],assignPublicIp=ENABLED}" \\
      --region ${config.awsRegion}`;

    run(createServiceCmd, 'Creating service');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Deployment Complete!\n');
  console.log('📊 Monitor deployment:');
  console.log(`  aws ecs describe-services --cluster ${config.clusterName} --services ${config.serviceName} --region ${config.awsRegion}\n`);
  console.log('🌐 To get the task public IP:');
  console.log(`  aws ecs list-tasks --cluster ${config.clusterName} --service-name ${config.serviceName} --region ${config.awsRegion}`);
  console.log('='.repeat(80));
}

deploy();
