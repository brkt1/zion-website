#!/bin/bash

# Deployment script for Yenege Website
# This script helps you deploy to Vercel with automatic setup

set -e

echo "🚀 Yenege Website Deployment Script"
echo "===================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "   Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "   Logging in..."
    vercel login
fi

echo "✅ Logged in to Vercel"
echo ""

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Set environment variables in Vercel dashboard:"
echo "      - REACT_APP_SUPABASE_URL"
echo "      - REACT_APP_SUPABASE_ANON_KEY"
echo "      - REACT_APP_API_URL"
echo "   2. Redeploy after setting environment variables"
echo "   3. Your site will auto-deploy on every git push to main"
echo ""

