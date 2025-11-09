# Railway Environment Variables Setup

Your backend is deployed at: **https://yenege-backend-production.up.railway.app**

## Required Environment Variables

You need to set these environment variables in your Railway project:

### 1. FRONTEND_URL
- **Value**: `https://www.yenege.com`
- **Purpose**: Allows CORS requests from your frontend

### 2. CHAPA_SECRET_KEY (Required for payments)
- **Value**: Your Chapa secret key (starts with `CHASECK_` or `CHASECK_TEST_`)
- **Purpose**: Used for payment processing

## How to Set Environment Variables

### Option 1: Via Railway Web Dashboard (Recommended)

1. Go to your Railway project: https://railway.com/project/59d9fbe7-cec2-4f6a-abfc-5fa63aef33da
2. Click on your service (yenege-backend)
3. Go to the **Variables** tab
4. Click **+ New Variable**
5. Add each variable:
   - Name: `FRONTEND_URL`, Value: `https://www.yenege.com`
   - Name: `CHAPA_SECRET_KEY`, Value: `your-chapa-secret-key`
6. Railway will automatically redeploy when you save

### Option 2: Via Railway CLI

```bash
cd server
railway variables --set "FRONTEND_URL=https://www.yenege.com"
railway variables --set "CHAPA_SECRET_KEY=your-chapa-secret-key"
```

## Verify Deployment

1. Check backend health: https://yenege-backend-production.up.railway.app/api/health
2. Check Railway logs: `railway logs` (from server directory)
3. Test payment endpoint (after setting CHAPA_SECRET_KEY)

## Next Steps

1. ✅ Backend deployed: https://yenege-backend-production.up.railway.app
2. ✅ Frontend environment variable updated
3. ⏳ Set Railway environment variables (see above)
4. ⏳ Frontend will redeploy automatically (triggered by git push)

## Troubleshooting

- **CORS errors**: Make sure `FRONTEND_URL` is set correctly
- **Payment errors**: Make sure `CHAPA_SECRET_KEY` is set
- **Service not found**: Wait a few minutes for the first deployment to complete

