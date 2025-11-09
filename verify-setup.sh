#!/bin/bash

# Comprehensive setup verification script

echo "🔍 Verifying Your Setup"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Step 1: Checking Local Configuration${NC}"
echo ""

# Check if .env files exist
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✅ server/.env exists${NC}"
    export $(grep -v '^#' server/.env | grep -v '^$' | xargs)
else
    echo -e "${YELLOW}⚠️  server/.env not found${NC}"
fi

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env not found (optional for frontend)${NC}"
fi

# Check render.yaml
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✅ render.yaml exists${NC}"
else
    echo -e "${RED}❌ render.yaml not found${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 2: Environment Variables Check${NC}"
echo ""

# Check required backend vars
if [ -n "$FRONTEND_URL" ]; then
    echo -e "${GREEN}✅ FRONTEND_URL = ${FRONTEND_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  FRONTEND_URL not set${NC}"
fi

if [ -n "$CHAPA_SECRET_KEY" ]; then
    CHAPA_PREVIEW="${CHAPA_SECRET_KEY:0:10}...${CHAPA_SECRET_KEY: -4}"
    echo -e "${GREEN}✅ CHAPA_SECRET_KEY = ${CHAPA_PREVIEW}${NC}"
else
    echo -e "${RED}❌ CHAPA_SECRET_KEY not set${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 3: Testing Backend Connection${NC}"
echo ""

# Ask for backend URL
echo "What is your Render backend URL?"
echo "Example: https://yenege-backend.onrender.com"
read -p "Backend URL: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="https://yenege-backend.onrender.com"
    echo "Using default: $BACKEND_URL"
fi

# Remove trailing slash
BACKEND_URL="${BACKEND_URL%/}"

echo ""
echo "Testing backend connection..."
echo ""

# Test health endpoint
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/api/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is accessible!${NC}"
    echo "   Status: $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
    BACKEND_OK=true
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ Cannot connect to backend${NC}"
    echo "   This usually means:"
    echo "   - Backend is not deployed yet"
    echo "   - URL is incorrect"
    echo "   - Service is still deploying"
    BACKEND_OK=false
else
    echo -e "${YELLOW}⚠️  Backend returned status: $HTTP_CODE${NC}"
    echo "   Response: $RESPONSE_BODY"
    BACKEND_OK=false
fi

echo ""
echo -e "${BLUE}📋 Step 4: Frontend Configuration${NC}"
echo ""

echo "Required Vercel environment variables:"
echo ""
echo "1. REACT_APP_SUPABASE_URL"
echo "   Should be: https://zjhnvtegoarvdqakqqkd.supabase.co"
echo ""
echo "2. REACT_APP_SUPABASE_ANON_KEY"
echo "   Should be set (check Vercel dashboard)"
echo ""
echo "3. REACT_APP_API_URL"
if [ "$BACKEND_OK" = true ]; then
    echo -e "   ${GREEN}Should be: ${BACKEND_URL}/api${NC}"
else
    echo -e "   ${YELLOW}Should be: ${BACKEND_URL}/api (after backend is deployed)${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 5: Summary${NC}"
echo ""

if [ "$BACKEND_OK" = true ]; then
    echo -e "${GREEN}✅ Backend is deployed and accessible${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify REACT_APP_API_URL in Vercel is set to: ${BACKEND_URL}/api"
    echo "2. Redeploy frontend if you just updated the URL"
    echo "3. Test the full payment flow"
else
    echo -e "${YELLOW}⚠️  Backend is not accessible yet${NC}"
    echo ""
    echo "Possible reasons:"
    echo "1. Backend is still deploying (wait a few minutes)"
    echo "2. Backend URL is incorrect"
    echo "3. Backend service is not created in Render"
    echo ""
    echo "To check:"
    echo "1. Go to Render dashboard: https://dashboard.render.com"
    echo "2. Check if your service is deployed"
    echo "3. Copy the correct service URL"
    echo "4. Update REACT_APP_API_URL in Vercel"
fi

echo ""
echo "=========================================="
echo "Verification Complete!"
echo "=========================================="

