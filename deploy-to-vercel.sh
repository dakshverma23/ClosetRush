#!/bin/bash

# ClosetRush Vercel Deployment Script
# This script helps deploy your app to Vercel

echo "🚀 ClosetRush Deployment Script"
echo "================================"
echo ""

# Check if git is clean
echo "📋 Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes!"
    echo "   Commit them first:"
    echo "   git add ."
    echo "   git commit -m 'your message'"
    exit 1
fi

echo "✅ Git is clean"
echo ""

# Check current branch
BRANCH=$(git branch --show-current)
echo "📍 Current branch: $BRANCH"

if [ "$BRANCH" != "main" ]; then
    echo "⚠️  You're not on the main branch!"
    echo "   Switch to main:"
    echo "   git checkout main"
    exit 1
fi

echo "✅ On main branch"
echo ""

# Pull latest changes
echo "⬇️  Pulling latest changes..."
git pull origin main

echo "✅ Up to date with remote"
echo ""

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎉 Deployment triggered!"
    echo ""
    echo "📊 Check deployment status:"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "⏱️  Deployment usually takes 1-3 minutes"
    echo ""
    echo "🔗 Your app will be live at:"
    echo "   https://your-app.vercel.app"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
