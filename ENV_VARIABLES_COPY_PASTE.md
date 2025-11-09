# 📋 Environment Variables - Copy & Paste

## 🔵 Render Backend Environment Variables

Copy these into Render Dashboard → Your Service → Environment tab:

```
FRONTEND_URL=https://www.yenege.com
CHAPA_SECRET_KEY=your-chapa-secret-key-here
NODE_ENV=production
```

**Note:** Replace `your-chapa-secret-key-here` with your actual Chapa secret key from your `.env` file.

---

## 🟢 Vercel Frontend Environment Variables

Copy these into Vercel Dashboard → Your Project → Settings → Environment Variables:

```
REACT_APP_SUPABASE_URL=https://zjhnvtegoarvdqakqqkd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII
REACT_APP_API_URL=https://yenege-backend.onrender.com/api
```

**Note:** 
- Update `REACT_APP_API_URL` with your actual Render backend URL after deployment
- The URL should end with `/api`

---

## 📝 Step-by-Step Copy Instructions

### For Render (Backend):

1. Go to Render Dashboard → Your Service → **Environment** tab
2. Click **"Add Environment Variable"**
3. Add each variable one by one:

   **Variable 1:**
   - Key: `FRONTEND_URL`
   - Value: `https://www.yenege.com`

   **Variable 2:**
   - Key: `CHAPA_SECRET_KEY`
   - Value: `(paste your actual Chapa secret key here)`

   **Variable 3:**
   - Key: `NODE_ENV`
   - Value: `production`

### For Vercel (Frontend):

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"** or edit existing ones
3. Add/Update each variable:

   **Variable 1:**
   - Key: `REACT_APP_SUPABASE_URL`
   - Value: `https://zjhnvtegoarvdqakqqkd.supabase.co`

   **Variable 2:**
   - Key: `REACT_APP_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaG52dGVnb2FydmRxYWtxcWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTEwNjcsImV4cCI6MjA3ODE2NzA2N30.psUwlT7mj-N9p4JN2DByHLnayrIkoeBdI81lcQWgmII`

   **Variable 3:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://yenege-backend.onrender.com/api`
   - **⚠️ Update this after you deploy to Render with your actual backend URL**

---

## 🔍 How to Get Your Chapa Secret Key

If you need to find your Chapa secret key:

1. Check your `server/.env` file
2. Look for the line: `CHAPA_SECRET_KEY=...`
3. Copy the value after the `=` sign

---

## ✅ Checklist

### Render Backend:
- [ ] `FRONTEND_URL` = `https://www.yenege.com`
- [ ] `CHAPA_SECRET_KEY` = (your actual key)
- [ ] `NODE_ENV` = `production`

### Vercel Frontend:
- [ ] `REACT_APP_SUPABASE_URL` = (already set)
- [ ] `REACT_APP_SUPABASE_ANON_KEY` = (already set)
- [ ] `REACT_APP_API_URL` = `https://yenege-backend.onrender.com/api` (update after Render deployment)

---

## 🚨 Important Notes

1. **CHAPA_SECRET_KEY** - Keep this secret! Never commit it to Git.
2. **REACT_APP_API_URL** - Update this in Vercel AFTER you deploy to Render and get your backend URL
3. **FRONTEND_URL** - Must match your actual frontend URL (with or without www)
4. After adding variables, **redeploy** your services for changes to take effect

