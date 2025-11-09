#!/bin/bash

# Script to set environment variables in Vercel
# This sets the required environment variables for the frontend

echo "🚀 Setting up Vercel environment variables..."
echo ""

# Supabase Configuration (from QUICK_DEPLOY.md)
REACT_APP_SUPABASE_URL="https://zjhnvtegoarvdqakqqkd.supabase.co"
REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII"

# Backend API URL - Update this with your actual backend URL
# If you haven't deployed the backend yet, you can set a placeholder
REACT_APP_API_URL="${REACT_APP_API_URL:-https://your-backend-url.com/api}"

# Set environment variables for production
echo "Setting REACT_APP_SUPABASE_URL..."
vercel env add REACT_APP_SUPABASE_URL production <<< "$REACT_APP_SUPABASE_URL"

echo "Setting REACT_APP_SUPABASE_ANON_KEY..."
vercel env add REACT_APP_SUPABASE_ANON_KEY production <<< "$REACT_APP_SUPABASE_ANON_KEY"

echo "Setting REACT_APP_API_URL..."
vercel env add REACT_APP_API_URL production <<< "$REACT_APP_API_URL"

# Also set for preview and development environments
echo ""
echo "Setting for preview environment..."
vercel env add REACT_APP_SUPABASE_URL preview <<< "$REACT_APP_SUPABASE_URL"
vercel env add REACT_APP_SUPABASE_ANON_KEY preview <<< "$REACT_APP_SUPABASE_ANON_KEY"
vercel env add REACT_APP_API_URL preview <<< "$REACT_APP_API_URL"

echo ""
echo "Setting for development environment..."
vercel env add REACT_APP_SUPABASE_URL development <<< "$REACT_APP_SUPABASE_URL"
vercel env add REACT_APP_SUPABASE_ANON_KEY development <<< "$REACT_APP_SUPABASE_ANON_KEY"
vercel env add REACT_APP_API_URL development <<< "$REACT_APP_API_URL"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📝 Note: If you have a backend deployed, update REACT_APP_API_URL with:"
echo "   vercel env rm REACT_APP_API_URL production"
echo "   vercel env add REACT_APP_API_URL production"
echo ""
echo "🔄 To trigger a new deployment with these variables, run:"
echo "   vercel --prod"

