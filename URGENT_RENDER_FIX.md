# 🚨 URGENT: Fix Render Deployment Error

## The Problem

Your Render deployment is **building the frontend instead of the backend**!

**Error:** `react-scripts: not found`  
**Cause:** Render is using the root directory (frontend) instead of the `server` directory (backend)

---

## ✅ Quick Fix (2 Options)

### Option 1: Fix in Render Dashboard (FASTEST - 2 minutes)

1. Go to: https://dashboard.render.com
2. Click on your service: **yenege-backend**
3. Go to **Settings** tab
4. Scroll to **Build & Deploy** section
5. **Change Root Directory:**
   - Current: (empty or root)
   - **Change to:** `server`
6. **Update Build Command:**
   - Remove: `cd server &&`
   - **Change to:** `npm install && npm run build`
7. **Update Start Command:**
   - Remove: `cd server &&`
   - **Change to:** `npm start`
8. Click **Save Changes**
9. Go to **Manual Deploy** tab
10. Click **Deploy latest commit**

### Option 2: Update render.yaml and Push (AUTOMATIC)

The `render.yaml` file has been fixed. Just push it:

```bash
git add render.yaml
git commit -m "Fix Render: set rootDir to server"
git push
```

Render will auto-deploy with correct settings.

---

## ✅ Correct Settings

**Root Directory:** `server`  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`  
**Plan:** `Free`

---

## 🔍 How to Verify It's Fixed

After redeploying, check the build logs. You should see:

✅ **Good (Backend):**
```
Installing dependencies...
Building TypeScript...
Server running on http://localhost:...
```

❌ **Bad (Frontend - what you're seeing now):**
```
react-scripts: not found
```

---

## 📝 Environment Variables

Make sure these are set in Render → Environment tab:

```
FRONTEND_URL=https://www.yenege.com
CHAPA_SECRET_KEY=your-chapa-secret-key
NODE_ENV=production
```

---

## 🚀 After Fix

Once deployment succeeds:
1. ✅ Copy your Render service URL
2. ✅ Update `REACT_APP_API_URL` in Vercel
3. ✅ Test: `curl https://your-backend-url.onrender.com/api/health`

---

**The render.yaml file is already fixed. Just push it or update in dashboard!** 🎯

