#!/bin/bash

# Render Deployment Setup Script - Reads from .env file
# This script reads environment variables from .env and prepares Render deployment

set -e

echo "🚀 Render Deployment Setup (from .env)"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for .env file in server directory first, then root
ENV_FILE=""
if [ -f "server/.env" ]; then
    ENV_FILE="server/.env"
    echo -e "${GREEN}✅ Found server/.env${NC}"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
    echo -e "${GREEN}✅ Found .env${NC}"
else
    echo -e "${RED}❌ No .env file found!${NC}"
    echo ""
    echo "Please create a .env file in the server directory with:"
    echo "  FRONTEND_URL=https://www.yenege.com"
    echo "  CHAPA_SECRET_KEY=your-chapa-secret-key"
    echo "  NODE_ENV=production"
    echo ""
    exit 1
fi

# Load environment variables from .env file
echo -e "${BLUE}📖 Loading environment variables from ${ENV_FILE}...${NC}"
echo ""

# Source the .env file (handle comments and empty lines)
export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

# Required variables for Render
REQUIRED_VARS=("FRONTEND_URL" "CHAPA_SECRET_KEY")

# Check for required variables
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   - ${RED}$var${NC}"
    done
    echo ""
    echo "Please add these to your ${ENV_FILE} file"
    exit 1
fi

# Display loaded variables (hide sensitive values)
echo -e "${GREEN}✅ Environment variables loaded:${NC}"
echo "   FRONTEND_URL = ${FRONTEND_URL}"
if [ -n "$CHAPA_SECRET_KEY" ]; then
    CHAPA_PREVIEW="${CHAPA_SECRET_KEY:0:10}...${CHAPA_SECRET_KEY: -4}"
    echo "   CHAPA_SECRET_KEY = ${CHAPA_PREVIEW}"
else
    echo "   CHAPA_SECRET_KEY = (not set)"
fi
echo "   NODE_ENV = ${NODE_ENV:-production}"
echo ""

# Update render.yaml with values from .env
echo -e "${BLUE}📝 Updating render.yaml with values from .env...${NC}"

cat > render.yaml << EOF
services:
  - type: web
    name: yenege-backend
    env: node
    plan: free
    region: oregon  # Change to your preferred region
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: ${NODE_ENV:-production}
      - key: FRONTEND_URL
        value: ${FRONTEND_URL}
      # CHAPA_SECRET_KEY should be set manually in Render dashboard for security
      # Value from .env: ${CHAPA_SECRET_KEY:0:10}...${CHAPA_SECRET_KEY: -4}
      # Go to: Render Dashboard → Your Service → Environment → Add Variable
EOF

echo -e "${GREEN}✅ Updated render.yaml${NC}"
echo ""

# Create a script to help set environment variables in Render
cat > set-render-env.sh << 'SCRIPT_EOF'
#!/bin/bash

# Script to set environment variables in Render from .env file
# Usage: ./set-render-env.sh

set -e

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI is not installed."
    echo "   Install it: https://render.com/docs/cli"
    echo ""
    echo "   Or set environment variables manually in Render dashboard:"
    echo "   1. Go to your service in Render dashboard"
    echo "   2. Go to Environment tab"
    echo "   3. Add variables manually"
    exit 1
fi

# Load .env file
ENV_FILE=""
if [ -f "server/.env" ]; then
    ENV_FILE="server/.env"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
else
    echo "❌ No .env file found!"
    exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

echo "🚀 Setting environment variables in Render..."
echo ""

# Set environment variables using Render CLI
if [ -n "$FRONTEND_URL" ]; then
    echo "Setting FRONTEND_URL..."
    render env set FRONTEND_URL="$FRONTEND_URL" --service yenege-backend
fi

if [ -n "$CHAPA_SECRET_KEY" ]; then
    echo "Setting CHAPA_SECRET_KEY..."
    render env set CHAPA_SECRET_KEY="$CHAPA_SECRET_KEY" --service yenege-backend
fi

if [ -n "$NODE_ENV" ]; then
    echo "Setting NODE_ENV..."
    render env set NODE_ENV="$NODE_ENV" --service yenege-backend
fi

echo ""
echo "✅ Environment variables set in Render!"
SCRIPT_EOF

chmod +x set-render-env.sh

echo -e "${GREEN}✅ Created set-render-env.sh helper script${NC}"
echo ""

# Create instructions file
cat > RENDER_ENV_INSTRUCTIONS.md << EOF
# Setting Environment Variables in Render

## Option 1: Manual (Recommended for first time)

1. Go to Render Dashboard → Your Service → **Environment** tab
2. Add these variables:

\`\`\`
FRONTEND_URL = ${FRONTEND_URL}
CHAPA_SECRET_KEY = (your secret key from .env)
NODE_ENV = ${NODE_ENV:-production}
\`\`\`

## Option 2: Using Render CLI

1. Install Render CLI: https://render.com/docs/cli
2. Login: \`render login\`
3. Run: \`./set-render-env.sh\`

## Option 3: Using render.yaml

The \`render.yaml\` file has been updated with your values.
However, **CHAPA_SECRET_KEY should be set manually** in the dashboard for security.

---

**Current values from .env:**
- FRONTEND_URL: ${FRONTEND_URL}
- CHAPA_SECRET_KEY: ${CHAPA_SECRET_KEY:0:10}...${CHAPA_SECRET_KEY: -4}
- NODE_ENV: ${NODE_ENV:-production}
EOF

echo -e "${GREEN}✅ Created RENDER_ENV_INSTRUCTIONS.md${NC}"
echo ""

# Summary
echo -e "${BLUE}📋 Summary:${NC}"
echo ""
echo "✅ Loaded environment variables from ${ENV_FILE}"
echo "✅ Updated render.yaml with your values"
echo "✅ Created helper scripts"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "   CHAPA_SECRET_KEY is NOT included in render.yaml for security"
echo "   You must add it manually in Render dashboard"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Push render.yaml to GitHub (if using auto-deploy)"
echo "2. Go to Render dashboard and create your service"
echo "3. Add CHAPA_SECRET_KEY manually in Environment tab"
echo "4. Or use: ./set-render-env.sh (requires Render CLI)"
echo ""
echo "📖 See RENDER_ENV_INSTRUCTIONS.md for details"

