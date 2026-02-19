#!/bin/bash

# Axior Dashboard Deployment Script
# Usage: ./deploy.sh "your commit message"

set -e

echo "🚀 Starting deployment..."

# Check if commit message is provided
if [ -z "$1" ]; then
    COMMIT_MSG="Update dashboard content"
else
    COMMIT_MSG="$1"
fi

echo "📝 Commit message: $COMMIT_MSG"

# Add all changes
echo "📦 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG" || {
    echo "⚠️  No changes to commit"
    exit 0
}

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push

echo "✅ Deployment triggered!"
echo "🌐 Your site will be live at: https://axiorreporting.axior.dev"
echo "⏱️  Deployment typically takes 1-2 minutes"
echo ""
echo "To check deployment status, run: gh run list --limit 1"
