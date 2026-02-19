#!/bin/bash

# Axior Dashboard AWS Amplify Deployment Script
# Deploys Next.js SSR app to AWS Lambda via Amplify

set -e

echo "🚀 Starting AWS Amplify Deployment..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | xargs)
fi

# Set AWS credentials from .env
export AWS_ACCESS_KEY_ID="${ADMIN_CLI_AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${ADMIN_CLI_AWS_SECRET_ACCESS_KEY}"
export AWS_REGION="${AWS_REGION:-us-east-1}"

# Configuration
APP_NAME="axiorreporting-dashboard"
REPOSITORY_URL="https://github.com/amaraxior/axiorreportingdashboard"
BRANCH="main"
CUSTOM_DOMAIN="axiorreporting.axior.dev"

echo "📋 Configuration:"
echo "  App Name: $APP_NAME"
echo "  Repository: $REPOSITORY_URL"
echo "  Branch: $BRANCH"
echo "  Custom Domain: $CUSTOM_DOMAIN"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Amplify app exists
echo "🔍 Checking if Amplify app exists..."
APP_ID=$(aws amplify list-apps --region $AWS_REGION --query "apps[?name=='$APP_NAME'].appId" --output text 2>/dev/null || echo "")

if [ -z "$APP_ID" ]; then
    echo "📦 Creating new Amplify app..."

    # Create Amplify app
    APP_ID=$(aws amplify create-app \
        --name "$APP_NAME" \
        --repository "$REPOSITORY_URL" \
        --platform WEB_COMPUTE \
        --region $AWS_REGION \
        --environment-variables \
            "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}" \
            "CLERK_SECRET_KEY=${CLERK_SECRET_KEY}" \
        --query 'app.appId' \
        --output text)

    echo "✅ Created Amplify app with ID: $APP_ID"

    # Create branch
    echo "🌿 Creating branch connection..."
    aws amplify create-branch \
        --app-id "$APP_ID" \
        --branch-name "$BRANCH" \
        --region $AWS_REGION \
        --enable-auto-build

    echo "✅ Branch created"

    # Create domain association
    echo "🌐 Configuring custom domain..."
    aws amplify create-domain-association \
        --app-id "$APP_ID" \
        --domain-name "${CUSTOM_DOMAIN#*.}" \
        --sub-domain-settings "prefix=axiorreporting,branchName=$BRANCH" \
        --region $AWS_REGION || echo "⚠️  Domain configuration will need manual setup"

else
    echo "✅ Found existing Amplify app with ID: $APP_ID"
fi

# Trigger deployment
echo "🚀 Triggering deployment..."
JOB_ID=$(aws amplify start-job \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH" \
    --job-type RELEASE \
    --region $AWS_REGION \
    --query 'jobSummary.jobId' \
    --output text)

echo "✅ Deployment triggered! Job ID: $JOB_ID"
echo ""
echo "📊 You can monitor the deployment at:"
echo "  https://console.aws.amazon.com/amplify/home?region=$AWS_REGION#/$APP_ID/$BRANCH/$JOB_ID"
echo ""
echo "🌐 Your app will be available at:"
echo "  https://$BRANCH.$APP_ID.amplifyapp.com"
echo "  https://$CUSTOM_DOMAIN (after DNS configuration)"
echo ""
echo "📝 DNS Configuration Required:"
echo "  Add this Route53 CNAME record:"
echo "  Name: $CUSTOM_DOMAIN"
echo "  Value: $BRANCH.$APP_ID.amplifyapp.com"
