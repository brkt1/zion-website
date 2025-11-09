# 🚀 Quick Deployment Guide

## Automatic Deployment Setup (5 minutes)

### Step 1: Deploy Frontend to Vercel

**Option A: Using the script (Easiest)**
```bash
npm run deploy
```

**Option B: Manual Vercel deployment**
```bash
# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod
```

**Option C: Via Vercel Dashboard (Recommended for auto-deploy)**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. Add environment variables (see below)
6. Click "Deploy"

### Step 2: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
REACT_APP_SUPABASE_URL=https://zjhnvtegoarvdqakqqkd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII
REACT_APP_API_URL=https://your-backend-url.com/api
```

**Important:** Replace `REACT_APP_API_URL` with your actual backend URL after deploying the backend.

### Step 3: Deploy Backend

**Option A: Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repository
4. Set root directory to `server`
5. Add environment variables:
   - `CHAPA_SECRET_KEY=your_key`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `PORT=5000`
6. Railway auto-deploys on push

**Option B: Render**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `server`
5. Build: `npm install && npm run build`
6. Start: `npm start`
7. Add environment variables
8. Deploy!

### Step 4: Update Frontend with Backend URL

After backend is deployed:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `REACT_APP_API_URL` with your backend URL
4. Redeploy (or wait for next push)

## ✅ Automatic Deployments

Once set up:
- **Every push to `main` branch** = Automatic deployment
- **Frontend**: Deploys to Vercel automatically
- **Backend**: Deploys to Railway/Render automatically

## 🔍 Verify Deployment

1. Check Vercel dashboard for frontend URL
2. Check Railway/Render dashboard for backend URL
3. Test the deployed site
4. Check browser console for any errors

## 🐛 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check for TypeScript/ESLint errors locally first

**Backend not connecting?**
- Verify `REACT_APP_API_URL` is correct
- Check backend logs in Railway/Render
- Verify CORS settings in backend

**Need help?**
- Check full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel docs: https://vercel.com/docs
- Railway docs: https://docs.railway.app

