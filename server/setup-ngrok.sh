#!/bin/bash

# Quick setup script for ngrok
# This script helps you set up ngrok authtoken if not already configured

echo "🔧 Ngrok Setup Helper"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo "   Install it from: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if authtoken is already configured
if ngrok config check &> /dev/null; then
    echo "✅ ngrok authtoken is already configured"
    echo ""
    echo "🚀 Starting ngrok..."
    echo ""
    exec ./start-ngrok.sh
else
    echo "⚠️  ngrok authtoken is not configured"
    echo ""
    echo "To set up ngrok:"
    echo "1. Sign up at: https://dashboard.ngrok.com/signup"
    echo "2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_AUTHTOKEN"
    echo ""
    read -p "Do you want to enter your authtoken now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your ngrok authtoken: " authtoken
        ngrok config add-authtoken "$authtoken"
        if [ $? -eq 0 ]; then
            echo "✅ Authtoken configured successfully!"
            echo ""
            echo "🚀 Starting ngrok..."
            echo ""
            exec ./start-ngrok.sh
        else
            echo "❌ Failed to configure authtoken. Please try again."
            exit 1
        fi
    else
        echo "Please configure your authtoken and then run: ./start-ngrok.sh"
        exit 0
    fi
fi

