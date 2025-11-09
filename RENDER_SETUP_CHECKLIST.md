# ✅ Render Setup Checklist

Follow these steps to deploy your backend to Render (FREE FOREVER):

## 🎯 Quick Steps (10 minutes total)

### Step 1: Create Render Account
- [ ] Go to https://render.com
- [ ] Click "Get Started for Free"
- [ ] Sign up with GitHub (recommended)
- [ ] Authorize Render to access your repositories

### Step 2: Deploy Backend Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository (`zion-website`)
- [ ] Configure service:
  - **Name:** `yenege-backend`
  - **Region:** Oregon (or closest to your users)
  - **Branch:** `main`
  - **Root Directory:** `server`
  - **Runtime:** `Node`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start`
  - **Plan:** `Free`

### Step 3: Set Environment Variables
**Before clicking "Create Web Service", scroll down to Environment Variables:**

- [ ] Add `FRONTEND_URL` = `https://www.yenege.com`
- [ ] Add `CHAPA_SECRET_KEY` = `your-actual-chapa-secret-key`
- [ ] Add `NODE_ENV` = `production`
- [ ] **DO NOT** add PORT (Render sets it automatically)

### Step 4: Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (~3-5 minutes)
- [ ] Watch build logs for any errors
- [ ] Wait for "Your service is live" message

### Step 5: Get Backend URL
- [ ] Copy your service URL (e.g., `https://yenege-backend.onrender.com`)
- [ ] Test health endpoint: `https://yenege-backend.onrender.com/api/health`
- [ ] Should return: `{"status":"ok","message":"Yenege Backend API is running"}`

### Step 6: Update Frontend
- [ ] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [ ] Update `REACT_APP_API_URL` to: `https://yenege-backend.onrender.com/api`
- [ ] Save and redeploy frontend

### Step 7: Test Connection
- [ ] Wait for frontend redeploy (~2 minutes)
- [ ] Visit your frontend URL
- [ ] Test payment flow or API calls
- [ ] Check browser console for errors

### Step 8: Set Up Uptime Monitor (Recommended)
**To prevent service from spinning down:**

- [ ] Go to https://uptimerobot.com
- [ ] Sign up (free)
- [ ] Add new monitor:
  - Type: HTTP(s)
  - URL: `https://yenege-backend.onrender.com/api/health`
  - Interval: 5 minutes
- [ ] Save monitor

---

## 🎉 Done!

Your backend is now:
- ✅ Running on Render (FREE FOREVER)
- ✅ Auto-deploying from GitHub
- ✅ Connected to frontend
- ✅ Ready for production

---

## 📝 Important Notes

1. **Service Spin-Down:** Render free tier services spin down after 15 minutes of inactivity. First request takes ~30 seconds. Use UptimeRobot (Step 8) to keep it alive.

2. **Environment Variables:** Make sure to set `CHAPA_SECRET_KEY` in Render dashboard (not in code).

3. **Port:** Don't set PORT manually - Render automatically provides it.

4. **Build Time:** First deployment takes 3-5 minutes. Subsequent deployments are faster.

---

## 🆘 Troubleshooting

**Service won't start?**
- Check build logs in Render dashboard
- Verify environment variables are set
- Ensure build command is correct

**CORS errors?**
- Verify `FRONTEND_URL` matches your actual frontend URL
- Redeploy after changing environment variables

**Service spins down?**
- Set up UptimeRobot monitor (Step 8)
- Or upgrade to paid plan for always-on

---

## 🔗 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Your Service:** https://dashboard.render.com/web (after creation)
- **UptimeRobot:** https://uptimerobot.com

---

**Need help?** See `MIGRATE_TO_RENDER.md` for detailed instructions.

