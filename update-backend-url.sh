#!/bin/bash

# Script to update REACT_APP_API_URL in Vercel
# Usage: ./update-backend-url.sh https://your-backend-url.com
# Example: ./update-backend-url.sh https://yenege-backend.onrender.com

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your backend URL"
    echo "Usage: ./update-backend-url.sh https://your-backend-url.com"
    echo ""
    echo "Examples:"
    echo "  ./update-backend-url.sh https://yenege-backend.onrender.com"
    echo "  ./update-backend-url.sh https://yenege-backend.railway.app"
    exit 1
fi

BACKEND_URL="$1"

# Ensure the URL ends with /api
if [[ ! "$BACKEND_URL" == */api ]]; then
    BACKEND_URL="${BACKEND_URL%/}/api"
fi

echo "🚀 Updating REACT_APP_API_URL to: $BACKEND_URL"
echo ""

# Remove existing environment variable for all environments
echo "Removing old REACT_APP_API_URL from production..."
vercel env rm REACT_APP_API_URL production --yes 2>/dev/null || true

echo "Removing old REACT_APP_API_URL from preview..."
vercel env rm REACT_APP_API_URL preview --yes 2>/dev/null || true

echo "Removing old REACT_APP_API_URL from development..."
vercel env rm REACT_APP_API_URL development --yes 2>/dev/null || true

echo ""
echo "Setting new REACT_APP_API_URL..."

# Set for production
echo "$BACKEND_URL" | vercel env add REACT_APP_API_URL production

# Set for preview
echo "$BACKEND_URL" | vercel env add REACT_APP_API_URL preview

# Set for development
echo "$BACKEND_URL" | vercel env add REACT_APP_API_URL development

echo ""
echo "✅ Environment variable updated successfully!"
echo ""
echo "🔄 To trigger a new deployment with the updated URL, run:"
echo "   vercel --prod"
echo ""
echo "Or push a commit to trigger automatic deployment:"
echo "   git commit --allow-empty -m 'Trigger deployment' && git push"

