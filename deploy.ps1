# Axior Dashboard Deployment Script
# Usage: .\deploy.ps1 "your commit message"

param(
    [string]$CommitMessage = "Update dashboard content"
)

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

Write-Host "📝 Commit message: $CommitMessage" -ForegroundColor Yellow

# Add all changes
Write-Host "📦 Staging changes..." -ForegroundColor Cyan
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
try {
    git commit -m $CommitMessage
} catch {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
    exit 0
}

# Push to GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "✅ Deployment triggered!" -ForegroundColor Green
Write-Host "🌐 Your site will be live at: https://axiorreporting.axior.dev" -ForegroundColor Cyan
Write-Host "⏱️  Deployment typically takes 1-2 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "To check deployment status, run: gh run list --limit 1" -ForegroundColor Gray
