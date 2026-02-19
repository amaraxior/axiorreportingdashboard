# Axior Dashboard AWS Amplify Deployment Script
# Deploys Next.js SSR app to AWS Lambda via Amplify

param(
    [string]$AppName = "axiorreporting-dashboard",
    [string]$Branch = "main",
    [string]$CustomDomain = "axiorreporting.axior.dev"
)

Write-Host "🚀 Starting AWS Amplify Deployment..." -ForegroundColor Cyan

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Set AWS credentials
$env:AWS_ACCESS_KEY_ID = $env:ADMIN_CLI_AWS_ACCESS_KEY_ID
$env:AWS_SECRET_ACCESS_KEY = $env:ADMIN_CLI_AWS_SECRET_ACCESS_KEY
$env:AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

$RepositoryUrl = "https://github.com/amaraxior/axiorreportingdashboard"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  App Name: $AppName"
Write-Host "  Repository: $RepositoryUrl"
Write-Host "  Branch: $Branch"
Write-Host "  Custom Domain: $CustomDomain"
Write-Host ""

# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Amplify app exists
Write-Host "🔍 Checking if Amplify app exists..." -ForegroundColor Cyan
$AppId = aws amplify list-apps --region $env:AWS_REGION --query "apps[?name=='$AppName'].appId" --output text 2>$null

if ([string]::IsNullOrWhiteSpace($AppId)) {
    Write-Host "📦 Creating new Amplify app..." -ForegroundColor Cyan

    # Create Amplify app
    $createResult = aws amplify create-app `
        --name $AppName `
        --repository $RepositoryUrl `
        --platform WEB_COMPUTE `
        --region $env:AWS_REGION `
        --environment-variables `
            "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" `
            "CLERK_SECRET_KEY=$env:CLERK_SECRET_KEY" `
        --query 'app.appId' `
        --output text

    $AppId = $createResult
    Write-Host "✅ Created Amplify app with ID: $AppId" -ForegroundColor Green

    # Create branch
    Write-Host "🌿 Creating branch connection..." -ForegroundColor Cyan
    aws amplify create-branch `
        --app-id $AppId `
        --branch-name $Branch `
        --region $env:AWS_REGION `
        --enable-auto-build | Out-Null

    Write-Host "✅ Branch created" -ForegroundColor Green

    # Create domain association
    Write-Host "🌐 Configuring custom domain..." -ForegroundColor Cyan
    $domainParts = $CustomDomain.Split('.')
    $rootDomain = $domainParts[-2] + "." + $domainParts[-1]

    try {
        aws amplify create-domain-association `
            --app-id $AppId `
            --domain-name $rootDomain `
            --sub-domain-settings "prefix=$($domainParts[0]),branchName=$Branch" `
            --region $env:AWS_REGION | Out-Null
    } catch {
        Write-Host "⚠️  Domain configuration will need manual setup" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Found existing Amplify app with ID: $AppId" -ForegroundColor Green
}

# Trigger deployment
Write-Host "🚀 Triggering deployment..." -ForegroundColor Cyan
$JobId = aws amplify start-job `
    --app-id $AppId `
    --branch-name $Branch `
    --job-type RELEASE `
    --region $env:AWS_REGION `
    --query 'jobSummary.jobId' `
    --output text

Write-Host "✅ Deployment triggered! Job ID: $JobId" -ForegroundColor Green
Write-Host ""
Write-Host "📊 You can monitor the deployment at:" -ForegroundColor Cyan
Write-Host "  https://console.aws.amazon.com/amplify/home?region=$($env:AWS_REGION)#/$AppId/$Branch/$JobId"
Write-Host ""
Write-Host "🌐 Your app will be available at:" -ForegroundColor Cyan
Write-Host "  https://$($Branch).$($AppId).amplifyapp.com"
Write-Host "  https://$CustomDomain (after DNS configuration)"
Write-Host ""
Write-Host "📝 DNS Configuration Required:" -ForegroundColor Yellow
Write-Host "  Add this Route53 CNAME record:"
Write-Host "  Name: $CustomDomain"
Write-Host "  Value: $($Branch).$($AppId).amplifyapp.com"
