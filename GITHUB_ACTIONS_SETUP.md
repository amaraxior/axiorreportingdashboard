# GitHub Actions CI/CD Setup Guide

This guide explains how to set up automated AWS Amplify deployment using GitHub Actions.

## Overview

Every push to the `main` branch automatically:
1. Builds the Next.js app
2. Deploys to AWS Amplify (Lambda + SSR)
3. Configures Clerk authentication
4. Updates the live site at `https://axiorreporting.axior.dev`

---

## Prerequisites

- GitHub repository with admin access
- AWS account with Amplify access
- Clerk account for authentication

---

## Setup GitHub Secrets

GitHub Actions requires sensitive credentials stored as **repository secrets**.

### 1. Navigate to Repository Settings

1. Go to https://github.com/amaraxior/axiorreportingdashboard
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2. Add Required Secrets

Add the following secrets from your `.env.local` file:

#### AWS Credentials

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key ID | `.env.local` → `ADMIN_CLI_AWS_ACCESS_KEY_ID` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Key | `.env.local` → `ADMIN_CLI_AWS_SECRET_ACCESS_KEY` |

#### Clerk Credentials

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | `.env.local` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `CLERK_SECRET_KEY` | Clerk Secret Key | `.env.local` → `CLERK_SECRET_KEY` |

### 3. Verify Secrets

Once added, you should see:
- ✅ `AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY`
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`

---

## How It Works

### Workflow File

Location: `.github/workflows/deploy-aws.yml`

```yaml
on:
  push:
    branches:
      - main        # Triggers on push to main
  workflow_dispatch:  # Allows manual trigger
```

### Deployment Steps

1. **Checkout code** - Fetches latest code from GitHub
2. **Setup Node.js** - Installs Node.js 20
3. **Install dependencies** - Runs `npm ci`
4. **Build Next.js** - Runs `npm run build`
5. **Deploy to AWS** - Runs `npm run deploy:aws` (TypeScript script)

### TypeScript Deployment Script

Location: `scripts/deploy.ts`

This script:
- Uses AWS SDK to interact with Amplify
- Creates/updates Amplify app
- Configures Clerk environment variables
- Triggers deployment
- Outputs deployment URLs

---

## Manual Deployment

You can also deploy manually:

### Using GitHub Actions UI

1. Go to https://github.com/amaraxior/axiorreportingdashboard/actions
2. Click **Deploy to AWS Amplify** workflow
3. Click **Run workflow** → **Run workflow**

### Using Local TypeScript Script

```bash
# Install dependencies first
npm install

# Run deployment script
npm run deploy:aws
```

This reads from your local `.env.local` file.

---

## Monitoring Deployments

### GitHub Actions

View deployment status:
- https://github.com/amaraxior/axiorreportingdashboard/actions

Each run shows:
- ✅ Build status
- ✅ Deployment logs
- ✅ Deployment URLs

### AWS Console

Monitor in Amplify Console:
- https://console.aws.amazon.com/amplify/home?region=us-east-1

---

## Updating Features

When you edit `data/features-roadmap.json`:

```bash
# Edit the file
code data/features-roadmap.json

# Commit and push (triggers auto-deployment)
git add data/features-roadmap.json
git commit -m "Update feature X progress"
git push
```

GitHub Actions automatically:
1. Detects the push
2. Builds the app
3. Deploys to AWS (~2-3 minutes)

---

## Environment Variables

### In GitHub Actions

Configured in `.github/workflows/deploy-aws.yml`:

```yaml
env:
  AWS_REGION: us-east-1
  AMPLIFY_APP_NAME: axiorreporting-dashboard
  CUSTOM_DOMAIN: axiorreporting.axior.dev
```

### In AWS Amplify

Automatically set by deployment script:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

---

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs:**
1. Go to https://github.com/amaraxior/axiorreportingdashboard/actions
2. Click on the failed run
3. Expand failed step to see error

**Common issues:**

| Error | Solution |
|-------|----------|
| `AWS credentials not found` | Verify GitHub secrets are set correctly |
| `Clerk secret missing` | Add Clerk secrets to GitHub |
| `App already exists` | Script will use existing app (this is normal) |
| `Domain configuration failed` | Manually configure in AWS Amplify Console |

### Secrets Not Working

Re-add the secret:
1. Delete the old secret
2. Add it again with the correct value
3. Ensure no extra spaces or newlines

### Build Fails

Check `package.json` dependencies:
```bash
npm install  # Install locally to test
npm run build  # Test build locally
```

---

## Security Best Practices

### Never Commit Secrets

❌ Never commit these files:
- `.env.local`
- `.env`
- Any file containing AWS keys or Clerk secrets

✅ These are gitignored:
```gitignore
.env*.local
.env
```

### Rotate Keys Regularly

1. Generate new AWS access keys
2. Update GitHub secrets
3. Delete old keys

### Limit AWS Permissions

Create an IAM user with only Amplify permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "amplify:*"
    ],
    "Resource": "*"
  }]
}
```

---

## CI/CD Pipeline Diagram

```
Developer Push
      ↓
GitHub Repository (main branch)
      ↓
GitHub Actions Triggered
      ↓
1. Install Dependencies (npm ci)
      ↓
2. Build Next.js (npm run build)
      ↓
3. Deploy TypeScript Script (npm run deploy:aws)
      ↓
   AWS SDK → AWS Amplify
      ↓
4. Create/Update App
      ↓
5. Configure Environment Variables
      ↓
6. Trigger Deployment
      ↓
AWS Lambda (SSR)
      ↓
Live Site: axiorreporting.axior.dev
```

---

## Rollback

If deployment fails:

### Option 1: Revert Commit
```bash
git revert HEAD
git push
```

### Option 2: Manual Rollback in AWS
1. Go to AWS Amplify Console
2. Find previous successful deployment
3. Click **Redeploy this version**

---

## Cost Monitoring

GitHub Actions:
- **Free tier**: 2,000 minutes/month (private repos)
- **Cost**: ~$0.008/minute after free tier

AWS Amplify:
- **Build**: ~$0.01/minute
- **Hosting**: ~$0.15/GB served
- **Lambda requests**: Free tier up to 1M requests

**Estimated monthly cost**: $5-20

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Clerk Documentation](https://clerk.com/docs)

---

## Support

For CI/CD issues:
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Test deployment locally with `npm run deploy:aws`
4. Check AWS Amplify Console for errors

---

*Last Updated: 2026-02-19*
