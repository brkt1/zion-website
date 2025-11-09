# 🚀 Step-by-Step: Migrate Backend to Render (Free Forever)

This guide will help you migrate your backend from Railway to Render in **~10 minutes**.

## Prerequisites

- ✅ GitHub repository with your code
- ✅ Render account (free, no credit card needed)
- ✅ Your Chapa secret key

---

## Step 1: Create Render Account (2 minutes)

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended for easy repo access)
4. Authorize Render to access your repositories

**✅ No credit card required for free tier!**

---

## Step 2: Create Web Service (3 minutes)

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - If not connected, click **"Configure account"** and authorize
   - Select your repository: `zion-website` (or your repo name)
   - Click **"Connect"**

4. Configure the service:
   ```
   Name: yenege-backend
   Region: Choose closest to your users (e.g., Oregon for US)
   Branch: main (or your default branch)
   Root Directory: server
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

5. **Don't click "Create Web Service" yet!** We need to set environment variables first.

---

## Step 3: Set Environment Variables (2 minutes)

Before creating the service, scroll down to **"Environment Variables"** section:

1. Click **"Add Environment Variable"**
2. Add these variables one by one:

   ```
   Key: FRONTEND_URL
   Value: https://www.yenege.com
   ```

   ```
   Key: CHAPA_SECRET_KEY
   Value: your-actual-chapa-secret-key-here
   ```

   ```
   Key: NODE_ENV
   Value: production
   ```

3. **Important:** Don't add `PORT` - Render automatically sets it

---

## Step 4: Deploy (3 minutes)

1. Scroll to bottom and click **"Create Web Service"**
2. Render will start building and deploying
3. Watch the build logs (this takes ~3-5 minutes)
4. Wait for **"Your service is live"** message

---

## Step 5: Get Your Backend URL

1. Once deployed, you'll see your service URL at the top
2. It will look like: `https://yenege-backend.onrender.com`
3. **Copy this URL** - you'll need it for the frontend

---

## Step 6: Test Backend (1 minute)

Test that your backend is working:

```bash
# Test health endpoint
curl https://yenege-backend.onrender.com/api/health

# Should return:
# {"status":"ok","message":"Yenege Backend API is running"}
```

Or visit in browser: `https://yenege-backend.onrender.com/api/health`

---

## Step 7: Update Frontend Configuration (2 minutes)

### Option A: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `REACT_APP_API_URL`
5. Update it to: `https://yenege-backend.onrender.com/api`
6. Click **Save**
7. Go to **Deployments** tab
8. Click **"Redeploy"** on the latest deployment

### Option B: Using Update Script

```bash
./update-backend-url.sh https://yenege-backend.onrender.com
```

Then trigger a redeploy in Vercel.

---

## Step 8: Test Full Connection (2 minutes)

1. Wait for frontend to redeploy (~2 minutes)
2. Visit your frontend URL
3. Try to make a payment or test an API call
4. Check browser console for any errors

---

## Step 9: Set Up Uptime Monitor (Optional but Recommended)

Render free tier services **spin down after 15 minutes of inactivity**. To keep it alive:

### Using UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Click **"Add New Monitor"**
4. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Yenege Backend
   - **URL:** `https://yenege-backend.onrender.com/api/health`
   - **Monitoring Interval:** 5 minutes
5. Click **"Create Monitor"**

This will ping your service every 5 minutes, keeping it alive!

---

## ✅ Migration Complete!

Your backend is now:
- ✅ Running on Render (free forever)
- ✅ Automatically deploying from GitHub
- ✅ Connected to your frontend
- ✅ Ready for production

---

## 🔧 Troubleshooting

### Service Won't Start

**Check build logs:**
1. Go to Render dashboard → Your service → **"Logs"** tab
2. Look for errors in build or runtime logs
3. Common issues:
   - Missing environment variables
   - Build command failing
   - Port not set correctly (Render auto-sets PORT)

### CORS Errors

**Verify FRONTEND_URL:**
1. Check environment variables in Render
2. Ensure `FRONTEND_URL` matches your actual frontend URL
3. Redeploy after changing environment variables

### Service Spins Down

**Solution:** Set up UptimeRobot (see Step 9 above)

### Build Fails

**Check:**
1. Root directory is set to `server`
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Node version is compatible (Render uses Node 18+ by default)

---

## 📊 Render vs Railway

| Feature | Railway (Paid) | Render (Free) |
|---------|----------------|---------------|
| Always On | ✅ Yes | ⚠️ Spins down (fixable) |
| Auto Deploy | ✅ Yes | ✅ Yes |
| Free SSL | ✅ Yes | ✅ Yes |
| Custom Domain | ✅ Yes | ✅ Yes |
| Cost | $5-20/month | **FREE** |
| Setup | Easy | Easy |

---

## 🎉 Next Steps

1. ✅ Backend migrated to Render
2. ✅ Frontend updated
3. ✅ Uptime monitor set up (recommended)
4. 🎯 Test payment flow end-to-end
5. 🎯 Monitor logs for any issues

**Your backend is now free forever on Render!** 🎊

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Free Tier Limits](https://render.com/docs/free)
- [UptimeRobot Setup Guide](https://uptimerobot.com/help/)

---

**Questions?** Check Render's documentation or community forums.

