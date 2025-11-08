# Ngrok Setup Guide

Ngrok is required to create a public URL for your localhost frontend, which is needed for Chapa payment integration.

## Step 1: Sign up for ngrok (if you haven't already)

1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Verify your email

## Step 2: Get your authtoken

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (it looks like: `2abc123def456ghi789jkl012mno345pq_6rStUvWxYz7AbCdEfGhIjKl`)

## Step 3: Configure ngrok

Run this command in your terminal (replace `YOUR_AUTHTOKEN` with your actual authtoken):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

## Step 4: Start ngrok

Once authenticated, you can start ngrok using one of these methods:

### Option A: Using the npm script (recommended)
```bash
cd server
npm run ngrok
```

### Option B: Using the shell script
```bash
cd server
./start-ngrok.sh
```

### Option C: Manual start
```bash
ngrok http 3000
```

Then manually update your `server/.env` file with the ngrok URL:
```env
FRONTEND_URL=https://your-ngrok-url.ngrok-free.app
```

## Step 5: Update your backend .env file

The scripts will automatically update your `.env` file, but if you're doing it manually:

1. Copy the HTTPS URL from ngrok (it will be shown in the terminal or at http://localhost:4040)
2. Update `server/.env`:
   ```env
   FRONTEND_URL=https://your-ngrok-url.ngrok-free.app
   ```

## Step 6: Restart your backend server

After updating the `.env` file, restart your backend server to pick up the new `FRONTEND_URL`:

```bash
cd server
npm run dev
```

## Troubleshooting

### "authentication failed" error
- Make sure you've run `ngrok config add-authtoken YOUR_AUTHTOKEN`
- Verify your authtoken is correct

### "port 3000 is already in use"
- Make sure your frontend is running on port 3000
- Or change the port: `ngrok http 3001` (and update your frontend port)

### Ngrok URL changes every time
- Free ngrok accounts get a new URL each time
- For a static URL, you need a paid ngrok account
- Or use the ngrok URL that's generated each time (the scripts will update it automatically)

## Viewing ngrok dashboard

Once ngrok is running, you can view the dashboard at:
- http://localhost:4040 (or http://localhost:4041 if 4040 is in use)

This shows:
- Your public ngrok URL
- Request logs
- Response details

