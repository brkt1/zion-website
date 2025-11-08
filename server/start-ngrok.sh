#!/bin/bash

# Script to start ngrok and update FRONTEND_URL in .env file

echo "🚀 Starting ngrok tunnel for frontend (port 3000)..."

# Start ngrok in the background and capture the process
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get the ngrok URL from the API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Make sure ngrok is running."
    echo "   Try running: ngrok http 3000"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Ngrok tunnel established: $NGROK_URL"
echo ""
echo "📝 Updating .env file..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Update or add FRONTEND_URL
if grep -q "FRONTEND_URL" .env; then
    # Update existing FRONTEND_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|FRONTEND_URL=.*|FRONTEND_URL=$NGROK_URL|" .env
    else
        # Linux
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$NGROK_URL|" .env
    fi
else
    # Add FRONTEND_URL if it doesn't exist
    echo "" >> .env
    echo "FRONTEND_URL=$NGROK_URL" >> .env
fi

echo "✅ Updated FRONTEND_URL in .env to: $NGROK_URL"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Make sure your frontend is running on port 3000"
echo "   2. Restart your backend server to pick up the new FRONTEND_URL"
echo "   3. Ngrok is running in the background (PID: $NGROK_PID)"
echo "   4. To stop ngrok, run: kill $NGROK_PID"
echo ""
echo "📋 Your ngrok URL: $NGROK_URL"
echo "   Use this URL in your Chapa dashboard if needed"
echo ""
echo "💡 To view ngrok dashboard: http://localhost:4040"

