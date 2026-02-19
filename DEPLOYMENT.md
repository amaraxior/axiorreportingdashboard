# Axior Dashboard Deployment Guide

## Overview

The Axior Features & Roadmap Dashboard supports two deployment methods:

1. **AWS Amplify (Lambda + SSR)** - Production deployment with Clerk authentication ✅ Recommended
2. **GitHub Pages (Static)** - Simple static deployment without authentication

---

## 🚀 Quick Deploy to AWS Lambda (Recommended)

### Prerequisites

- AWS CLI installed
- GitHub repository access
- Clerk account configured

### Deploy

**Windows (PowerShell):**
```powershell
.\deploy-aws.ps1
```

**macOS/Linux (Bash):**
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

This will:
- Create AWS Amplify app (if not exists)
- Configure Lambda for SSR
- Set up Clerk authentication
- Deploy to https://axiorreporting.axior.dev

---

## 📝 Deployment Scripts

### Local Content Updates

When you edit `data/features-roadmap.json`:

**Windows:**
```powershell
.\deploy.ps1 "Update features data"
```

**macOS/Linux:**
```bash
./deploy.sh "Update features data"
```

This pushes changes to GitHub, which triggers automatic deployment via:
- **AWS Amplify**: Auto-deploys with Lambda SSR (~2-3 minutes)
- **GitHub Pages**: Auto-deploys static site (~1 minute)

---

## 🔐 Clerk Authentication Setup

The dashboard uses Clerk for authentication with SSR support on AWS Lambda.

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

These are automatically configured in AWS Amplify during deployment.

### Features

- **Sign In Button**: Header right side (when not authenticated)
- **User Button**: Profile menu (when authenticated)
- **Protected Routes**: Optional - configure in `middleware.ts`

---

## 🌐 AWS Amplify Deployment Details

### Architecture

```
User Request
    ↓
Route53 DNS (axiorreporting.axior.dev)
    ↓
AWS Amplify
    ↓
AWS Lambda (Next.js SSR)
    ↓
Clerk Auth Verification
    ↓
Rendered Dashboard
```

### Configuration Files

- `amplify.yml` - Build configuration
- `middleware.ts` - Clerk auth middleware
- `.env.local` - Environment variables (not committed)

### AWS Resources Created

1. **Amplify App**: `axiorreporting-dashboard`
2. **Lambda Functions**: Auto-managed by Amplify
3. **CloudFront Distribution**: CDN for assets
4. **S3 Buckets**: Build artifacts and static assets

---

## 🔧 DNS Configuration

### Route53 CNAME Record

Add this record in your `axior.dev` hosted zone:

```
Type: CNAME
Name: axiorreporting
Value: main.<APP_ID>.amplifyapp.com
TTL: 300
```

Find your `<APP_ID>` after first deployment - the script will output it.

### Alternative: A Records

If using apex domain or requiring A records:

```
Type: A
Name: axiorreporting
Value: <Amplify IP addresses>
Alias: Yes
```

---

## 📊 Monitoring & Logs

### Check Deployment Status

```bash
aws amplify list-jobs --app-id <APP_ID> --branch-name main --region us-east-1
```

### View Logs

Access via AWS Console:
https://console.aws.amazon.com/amplify/

Or use CloudWatch Logs:
```bash
aws logs tail /aws/amplify/<APP_ID> --follow
```

---

## 🔄 Update Features Data

### 1. Edit JSON

Edit `data/features-roadmap.json`:

```json
{
  "id": 12,
  "name": "New Feature Name",
  "status": "in-progress",
  "completion": 25,
  ...
}
```

### 2. Deploy

```bash
./deploy.sh "Add new feature: Feature Name"
```

### 3. Verify

Visit https://axiorreporting.axior.dev (wait ~2 minutes for deployment)

---

## 🐛 Troubleshooting

### Issue: Clerk Auth Not Working

**Solution**: Ensure environment variables are set in AWS Amplify:

```bash
aws amplify update-app \
  --app-id <APP_ID> \
  --environment-variables \
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
    "CLERK_SECRET_KEY=$CLERK_SECRET_KEY" \
  --region us-east-1
```

### Issue: 404 Errors on Assets

**Solution**: Check `next.config.ts` - ensure no `basePath` is set for custom domains.

### Issue: Deployment Fails

**Solution**: Check build logs:

```bash
aws amplify get-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-id <JOB_ID> \
  --region us-east-1
```

### Issue: DNS Not Resolving

**Solution**: Verify Route53 CNAME record points to Amplify domain. DNS propagation takes 5-30 minutes.

---

## 💰 Cost Estimation

AWS Amplify pricing (as of 2026):

- **Build minutes**: ~$0.01/minute ($0.02-$0.03 per deploy)
- **Hosting**: ~$0.15/GB served ($5-10/month for typical usage)
- **SSR requests**: ~$0.30 per million requests

Expected monthly cost: **$5-20** depending on traffic.

---

## 🔐 Security

### Environment Variables

- Never commit `.env.local` to git
- Store sensitive keys in AWS Amplify environment variables
- Rotate Clerk keys regularly

### Access Control

- Dashboard is publicly accessible by default
- Add route protection in `middleware.ts` if needed
- Use Clerk roles/permissions for advanced access control

---

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Clerk Next.js Documentation](https://clerk.com/docs/nextjs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Support

For deployment issues:

1. Check AWS Amplify Console logs
2. Verify `.env.local` configuration
3. Ensure AWS credentials have required permissions
4. Check Route53 DNS configuration

---

*Last Updated: 2026-02-19*
