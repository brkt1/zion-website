#!/bin/bash

# Start ngrok and update .env file with the public URL

echo "🚀 Starting ngrok..."

# Start ngrok in background
ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 5

# Get the public URL
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Failed to get ngrok URL. Check if ngrok is running: http://localhost:4040"
    echo "Make sure ngrok is authenticated: ngrok config add-authtoken YOUR_TOKEN"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Ngrok is running!"
echo "🌐 Public URL: $PUBLIC_URL"
echo "📝 Updating server/.env file..."

# Update .env file
cd server
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=$PUBLIC_URL|" .env

echo "✅ Updated FRONTEND_URL to: $PUBLIC_URL"
echo ""
echo "🔄 Please restart your backend server to pick up the new URL"
echo "📊 Ngrok web interface: http://localhost:4040"
echo ""
echo "To stop ngrok, run: pkill -f ngrok"

