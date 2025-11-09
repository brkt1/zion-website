# ⚡ Quick Update: Vercel Frontend → Render Backend

## 3-Step Process

### 1️⃣ Get Your Render Backend URL
After deploying to Render, copy your service URL:
- Example: `https://yenege-backend.onrender.com`
- Add `/api` to the end: `https://yenege-backend.onrender.com/api`

### 2️⃣ Update Vercel Environment Variable

**Via Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Click your project
3. **Settings** → **Environment Variables**
4. Find `REACT_APP_API_URL`
5. Update to: `https://yenege-backend.onrender.com/api`
6. **Save**

**Via Script:**
```bash
./update-backend-url.sh https://yenege-backend.onrender.com
```

### 3️⃣ Redeploy Frontend

**In Vercel Dashboard:**
- Click **"Redeploy"** on latest deployment
- Or push a commit to trigger auto-deploy

**Done!** ✅

---

## Verify It Works

1. Visit your frontend URL
2. Open browser console (F12)
3. Test a payment or API call
4. Check for errors

---

**Need help?** See `UPDATE_VERCEL_FRONTEND.md` for detailed instructions.

