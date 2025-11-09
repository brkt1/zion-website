# 🔧 Fix Render Deployment Error

## Problem

Your Render deployment is failing because:
- ❌ It's trying to build the **frontend** (React app) instead of the **backend**
- ❌ `react-scripts: not found` error means it's in the wrong directory
- ❌ Root directory is not set to `server`

## Solution

### Option 1: Fix in Render Dashboard (Recommended)

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your service (`yenege-backend`)
3. Go to **Settings** tab
4. Scroll down to **Build & Deploy** section
5. Update these settings:

   **Root Directory:**
   ```
   server
   ```

   **Build Command:**
   ```
   npm install && npm run build
   ```

   **Start Command:**
   ```
   npm start
   ```

6. Click **Save Changes**
7. Go to **Manual Deploy** tab
8. Click **Deploy latest commit**

### Option 2: Update render.yaml and Push

The `render.yaml` file has been updated. Push it to GitHub:

```bash
git add render.yaml
git commit -m "Fix Render configuration - set rootDir to server"
git push
```

Render will auto-deploy with the correct settings.

---

## ✅ Correct Configuration

**Root Directory:** `server`  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`  
**Plan:** `Free`

---

## 🔍 Verify

After fixing, check the build logs:
- Should see: "Installing dependencies..."
- Should see: "Building TypeScript..."
- Should see: "Server running on http://localhost:..."
- Should NOT see: "react-scripts" errors

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
1. Copy your Render service URL
2. Update `REACT_APP_API_URL` in Vercel
3. Test the connection

