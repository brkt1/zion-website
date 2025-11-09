# ✅ Quick Verification Checklist

## What to Check After Configuration

### 1. Backend (Render)

**Check if backend is deployed:**
- Go to: https://dashboard.render.com
- Check if your service shows "Live" status
- Copy your service URL (e.g., `https://yenege-backend.onrender.com`)

**Test backend health:**
```bash
curl https://your-backend-url.onrender.com/api/health
```

Should return: `{"status":"ok","message":"Yenege Backend API is running"}`

**Environment variables in Render:**
- [ ] `FRONTEND_URL` = `https://www.yenege.com` (or your frontend URL)
- [ ] `CHAPA_SECRET_KEY` = (your secret key)
- [ ] `NODE_ENV` = `production`

---

### 2. Frontend (Vercel)

**Check environment variables:**
- Go to: https://vercel.com/dashboard
- Your Project → Settings → Environment Variables

**Required variables:**
- [ ] `REACT_APP_SUPABASE_URL` = `https://zjhnvtegoarvdqakqqkd.supabase.co`
- [ ] `REACT_APP_SUPABASE_ANON_KEY` = (your anon key)
- [ ] `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`

**Important:** Make sure `REACT_APP_API_URL` matches your actual Render backend URL!

---

### 3. Test Connection

**Option 1: Use test script**
```bash
BACKEND_URL=https://your-backend-url.onrender.com node test-connection.js
```

**Option 2: Manual test**
1. Visit your frontend URL
2. Open browser console (F12)
3. Try to make a payment or API call
4. Check for errors

---

### 4. Common Issues

**Backend returns 404:**
- Service might still be deploying (wait 2-5 minutes)
- Check Render dashboard for deployment status
- Verify the URL is correct

**CORS errors:**
- Check `FRONTEND_URL` in Render matches your Vercel frontend URL exactly
- Redeploy backend after updating `FRONTEND_URL`

**Environment variables not working:**
- Make sure you **redeployed** after adding/updating variables
- Environment variables are baked in at build time

---

## Quick Test Commands

```bash
# Test backend health
curl https://your-backend-url.onrender.com/api/health

# Test with specific URL
BACKEND_URL=https://your-backend-url.onrender.com node test-connection.js

# Run verification script
./verify-setup.sh
```

---

## ✅ All Good?

If everything checks out:
1. ✅ Backend is accessible
2. ✅ Frontend environment variables are set
3. ✅ No CORS errors
4. ✅ Payment flow works

**You're all set!** 🎉

