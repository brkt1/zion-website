#!/bin/bash

# Render Deployment Setup Script
# This script prepares your project for Render deployment
# It can read from .env file if available

set -e

echo "🚀 Render Deployment Setup"
echo "=========================="
echo ""

# Check if .env file exists and load it
ENV_FILE=""
if [ -f "server/.env" ]; then
    ENV_FILE="server/.env"
    echo "📖 Found server/.env - loading environment variables..."
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
elif [ -f ".env" ]; then
    ENV_FILE=".env"
    echo "📖 Found .env - loading environment variables..."
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
fi
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if render.yaml exists, create/update it
if [ ! -f "render.yaml" ] || [ -n "$ENV_FILE" ]; then
    if [ -n "$ENV_FILE" ]; then
        echo -e "${BLUE}📝 Updating render.yaml with values from ${ENV_FILE}...${NC}"
    else
        echo -e "${YELLOW}⚠️  render.yaml not found. Creating it...${NC}"
    fi
    
    # Use values from .env if available, otherwise use defaults
    FRONTEND_URL_VALUE="${FRONTEND_URL:-https://www.yenege.com}"
    NODE_ENV_VALUE="${NODE_ENV:-production}"
    
    cat > render.yaml << EOF
services:
  - type: web
    name: yenege-backend
    env: node
    plan: free
    region: oregon
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: ${NODE_ENV_VALUE}
      - key: FRONTEND_URL
        value: ${FRONTEND_URL_VALUE}
      # CHAPA_SECRET_KEY should be set manually in Render dashboard for security
      # Go to: Render Dashboard → Your Service → Environment → Add Variable
EOF
    if [ -n "$ENV_FILE" ]; then
        echo -e "${GREEN}✅ Updated render.yaml with values from ${ENV_FILE}${NC}"
    else
        echo -e "${GREEN}✅ Created render.yaml${NC}"
    fi
else
    echo -e "${GREEN}✅ render.yaml exists${NC}"
fi

# Check if server directory exists
if [ ! -d "server" ]; then
    echo -e "${YELLOW}❌ server directory not found!${NC}"
    exit 1
fi

# Check if server/package.json exists
if [ ! -f "server/package.json" ]; then
    echo -e "${YELLOW}❌ server/package.json not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server directory structure looks good${NC}"
echo ""

# Check if build script exists
if grep -q '"build"' server/package.json; then
    echo -e "${GREEN}✅ Build script found${NC}"
else
    echo -e "${YELLOW}⚠️  Build script not found in package.json${NC}"
fi

# Check if start script exists
if grep -q '"start"' server/package.json; then
    echo -e "${GREEN}✅ Start script found${NC}"
else
    echo -e "${YELLOW}⚠️  Start script not found in package.json${NC}"
fi

echo ""
if [ -n "$ENV_FILE" ]; then
    echo -e "${BLUE}📋 Environment Variables from ${ENV_FILE}:${NC}"
    echo "   FRONTEND_URL = ${FRONTEND_URL:-not set}"
    if [ -n "$CHAPA_SECRET_KEY" ]; then
        CHAPA_PREVIEW="${CHAPA_SECRET_KEY:0:10}...${CHAPA_SECRET_KEY: -4}"
        echo "   CHAPA_SECRET_KEY = ${CHAPA_PREVIEW}"
    else
        echo "   CHAPA_SECRET_KEY = (not set)"
    fi
    echo "   NODE_ENV = ${NODE_ENV:-production}"
    echo ""
fi

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Go to https://render.com and sign up (free, no credit card)"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Render will auto-detect render.yaml OR configure manually:"
echo "   - Root Directory: server"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo ""
echo "5. Add environment variables in Render dashboard:"
if [ -n "$FRONTEND_URL" ]; then
    echo "   - FRONTEND_URL = ${FRONTEND_URL}"
else
    echo "   - FRONTEND_URL = https://www.yenege.com"
fi
if [ -n "$CHAPA_SECRET_KEY" ]; then
    echo "   - CHAPA_SECRET_KEY = (from your .env file)"
else
    echo "   - CHAPA_SECRET_KEY = your-chapa-secret-key"
fi
echo "   - NODE_ENV = ${NODE_ENV:-production}"
echo ""
echo "6. Click 'Create Web Service'"
echo ""
echo "7. After deployment, update REACT_APP_API_URL in Vercel"
echo ""
if [ -n "$ENV_FILE" ]; then
    echo -e "${YELLOW}💡 Tip: Use ./setup-render-from-env.sh for more detailed .env setup${NC}"
    echo ""
fi
echo -e "${GREEN}✅ Your project is ready for Render deployment!${NC}"
echo ""
echo "📖 For detailed instructions, see: MIGRATE_TO_RENDER.md"
echo "📋 For checklist, see: RENDER_SETUP_CHECKLIST.md"

