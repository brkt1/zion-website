#!/bin/bash

# Script to show environment variables for easy copy-paste
# This reads from your .env file and displays them in a copy-friendly format

echo "=========================================="
echo "ENVIRONMENT VARIABLES - COPY & PASTE"
echo "=========================================="
echo ""

# Check for .env file
ENV_FILE=""
if [ -f "server/.env" ]; then
    ENV_FILE="server/.env"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
else
    echo "❌ No .env file found!"
    echo "Please create server/.env with your environment variables"
    exit 1
fi

echo "📖 Reading from: $ENV_FILE"
echo ""

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

echo "=========================================="
echo "RENDER BACKEND ENVIRONMENT VARIABLES"
echo "=========================================="
echo ""
echo "Copy these into Render Dashboard → Environment tab:"
echo ""
echo "FRONTEND_URL=${FRONTEND_URL:-https://www.yenege.com}"
echo ""
if [ -n "$CHAPA_SECRET_KEY" ]; then
    echo "CHAPA_SECRET_KEY=${CHAPA_SECRET_KEY}"
else
    echo "CHAPA_SECRET_KEY=(NOT SET - add your Chapa secret key)"
fi
echo ""
echo "NODE_ENV=${NODE_ENV:-production}"
echo ""

echo "=========================================="
echo "VERCEL FRONTEND ENVIRONMENT VARIABLES"
echo "=========================================="
echo ""
echo "Copy these into Vercel Dashboard → Settings → Environment Variables:"
echo ""

# Check if frontend env vars exist
if [ -f ".env" ]; then
    export $(grep -v '^#' ".env" | grep -v '^$' | xargs)
fi

echo "REACT_APP_SUPABASE_URL=${REACT_APP_SUPABASE_URL:-https://zjhnvtegoarvdqakqqkd.supabase.co}"
echo ""
echo "REACT_APP_SUPABASE_ANON_KEY=${REACT_APP_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII}"
echo ""
echo "REACT_APP_API_URL=${REACT_APP_API_URL:-https://yenege-backend.onrender.com/api}"
echo ""

echo "=========================================="
echo "NOTES"
echo "=========================================="
echo ""
echo "1. Update REACT_APP_API_URL in Vercel AFTER deploying to Render"
echo "2. Replace the URL with your actual Render backend URL"
echo "3. After adding variables, redeploy your services"
echo ""

