# Quick Start: GitHub Actions CI/CD

## ✅ What Was Created

1. **TypeScript Deployment Script**: `scripts/deploy.ts`
   - Uses AWS SDK (@aws-sdk/client-amplify)
   - Reads credentials from `.env.local`
   - Deploys to AWS Amplify

2. **GitHub Actions Workflow**: `.github/workflows/deploy-aws.yml`
   - Auto-deploys on push to `main`
   - Uses GitHub Secrets for credentials
   - Runs on every commit

3. **Setup Guide**: `GITHUB_ACTIONS_SETUP.md`
   - Complete instructions for GitHub Secrets
   - Troubleshooting guide
   - Security best practices

---

## 🚀 Setup (5 Minutes)

### Step 1: Add GitHub Secrets

Go to: https://github.com/amaraxior/axiorreportingdashboard/settings/secrets/actions/new

Add these 4 secrets from your `.env.local` file:

| Secret Name | Value from .env.local |
|------------|----------------------|
| `AWS_ACCESS_KEY_ID` | `ADMIN_CLI_AWS_ACCESS_KEY_ID` |
| `AWS_SECRET_ACCESS_KEY` | `ADMIN_CLI_AWS_SECRET_ACCESS_KEY` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `CLERK_SECRET_KEY` | `CLERK_SECRET_KEY` |

### Step 2: Push to GitHub

```bash
cd D:\projects\axior\axior\projectdashboard
git push
```

### Step 3: Monitor Deployment

Watch the deployment: https://github.com/amaraxior/axiorreportingdashboard/actions

Takes ~2-3 minutes to complete.

---

## 🎯 Usage

### Automated (Recommended)

Every push automatically deploys:

```bash
# Edit features
code data/features-roadmap.json

# Commit and push (triggers deployment)
git add .
git commit -m "Update features"
git push
```

### Manual Deployment

Run locally when needed:

```bash
npm run deploy:aws
```

---

## 📁 Files Created

```
✅ scripts/deploy.ts                       # TypeScript AWS deployment script
✅ .github/workflows/deploy-aws.yml        # GitHub Actions workflow
✅ GITHUB_ACTIONS_SETUP.md                 # Complete setup guide
✅ package.json                            # Added deploy:aws script + AWS SDK
```

---

## 🔐 Environment Variables

### Local (.env.local)
```env
ADMIN_CLI_AWS_ACCESS_KEY_ID=AKIA...
ADMIN_CLI_AWS_SECRET_ACCESS_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### GitHub Secrets
Set in repository settings → Secrets and variables → Actions

---

## ✅ Verify Setup

1. **Check Secrets**: Visit https://github.com/amaraxior/axiorreportingdashboard/settings/secrets/actions
   - Should see 4 secrets listed

2. **Trigger Workflow**: Push any commit or click "Run workflow"
   - Visit: https://github.com/amaraxior/axiorreportingdashboard/actions

3. **Check Deployment**: After ~3 minutes
   - AWS Console: https://console.aws.amazon.com/amplify
   - Live Site: https://axiorreporting.axior.dev

---

## 🐛 Troubleshooting

### Workflow Fails: "AWS credentials not found"

**Fix**: Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub Secrets

### Build Fails Locally

```bash
# Test TypeScript script
npm run deploy:aws

# If errors, check .env.local has all required variables
```

### Deployment Succeeds but Site Not Working

1. Check AWS Amplify Console for build logs
2. Verify Clerk secrets are set correctly
3. Check custom domain DNS configuration

---

## 📊 Workflow Status

Check deployment status at any time:

https://github.com/amaraxior/axiorreportingdashboard/actions

- ✅ Green checkmark = Successful deployment
- ❌ Red X = Failed (click to see logs)
- 🟡 Yellow dot = In progress

---

## 💰 Cost

- **GitHub Actions**: Free (2,000 minutes/month private repos)
- **AWS Amplify**: ~$5-20/month depending on traffic

---

## 📚 Full Documentation

For detailed information, see:
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - Complete guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options
- [README.md](./README.md) - Project overview

---

*Setup Time: ~5 minutes | Deployment Time: ~2-3 minutes*
