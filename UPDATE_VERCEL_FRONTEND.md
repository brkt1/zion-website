# 🔄 Update Vercel Frontend for Render Backend

This guide shows you how to update your existing Vercel frontend to connect to your new Render backend.

## Quick Steps

### Step 1: Deploy Backend to Render First

1. Deploy your backend to Render (follow `RENDER_SETUP_CHECKLIST.md`)
2. Wait for deployment to complete
3. **Copy your Render backend URL** (e.g., `https://yenege-backend.onrender.com`)

### Step 2: Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (your frontend project)
3. Go to **Settings** → **Environment Variables**
4. Find `REACT_APP_API_URL` in the list
5. Click on it to edit, or delete and recreate it
6. Set the value to: `https://yenege-backend.onrender.com/api`
   - **Important:** Make sure it ends with `/api`
7. Select environment: **Production**, **Preview**, and **Development** (or just Production if you prefer)
8. Click **Save**

### Step 3: Redeploy Frontend

**Option A: Automatic Redeploy (Recommended)**
- After saving the environment variable, Vercel will prompt you to redeploy
- Click **"Redeploy"** on the latest deployment
- Or wait for the next git push to trigger auto-deploy

**Option B: Manual Redeploy**
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Confirm redeployment

**Option C: Trigger via Git Push**
```bash
git commit --allow-empty -m "Trigger Vercel redeploy with new backend URL"
git push
```

### Step 4: Verify Connection

1. Wait for deployment to complete (~2 minutes)
2. Visit your frontend URL
3. Open browser console (F12)
4. Test a feature that uses the backend (e.g., payment flow)
5. Check for any CORS or connection errors

---

## Using the Update Script

If you have the `update-backend-url.sh` script, you can use it:

```bash
./update-backend-url.sh https://yenege-backend.onrender.com
```

This will:
- Update `REACT_APP_API_URL` in Vercel for all environments
- You'll still need to trigger a redeploy

---

## Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `REACT_APP_SUPABASE_URL` - Your Supabase URL
- ✅ `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anon key
- ✅ `REACT_APP_API_URL` - **Update this to your Render backend URL** (e.g., `https://yenege-backend.onrender.com/api`)

---

## Testing the Connection

After redeploying, test these:

1. **Health Check:**
   - Visit: `https://yenege-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Yenege Backend API is running"}`

2. **Frontend API Calls:**
   - Try making a payment
   - Check browser console for errors
   - Verify API requests are going to the Render backend

3. **CORS:**
   - If you see CORS errors, verify `FRONTEND_URL` in Render matches your Vercel frontend URL
   - Make sure it's set to: `https://www.yenege.com` or your actual Vercel domain

---

## Troubleshooting

### CORS Errors

**Problem:** Browser shows CORS errors when calling backend

**Solution:**
1. Check Render dashboard → Your Service → Environment
2. Verify `FRONTEND_URL` is set to your Vercel frontend URL
3. It should match exactly (including `www.` if your site uses it)
4. Redeploy Render service after updating

### 404 Errors

**Problem:** Frontend can't reach backend endpoints

**Solution:**
1. Verify `REACT_APP_API_URL` ends with `/api`
2. Check Render service is running (visit health endpoint)
3. Verify the URL is correct in Vercel environment variables

### Environment Variable Not Updating

**Problem:** Changes to environment variables not taking effect

**Solution:**
1. Make sure you saved the environment variable
2. **Redeploy** the frontend (environment variables are baked in at build time)
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard  
**Render Dashboard:** https://dashboard.render.com

**Backend URL Format:** `https://[service-name].onrender.com/api`  
**Health Check:** `https://[service-name].onrender.com/api/health`

---

## Summary

1. ✅ Deploy backend to Render
2. ✅ Copy Render backend URL
3. ✅ Update `REACT_APP_API_URL` in Vercel
4. ✅ Redeploy frontend
5. ✅ Test connection

**That's it!** Your existing Vercel frontend will now connect to your Render backend.

