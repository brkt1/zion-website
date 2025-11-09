# Deployment Guide

This guide covers automatic deployment setup for the Yenege website.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

Vercel provides automatic deployments from GitHub with zero configuration.

#### Steps:

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings from `vercel.json`

3. **Configure Environment Variables**:
   In Vercel dashboard → Project Settings → Environment Variables, add:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_API_URL=your_backend_api_url
   ```

4. **Deploy!**
   - Vercel will automatically deploy on every push to `main` branch
   - You'll get a URL like: `https://your-project.vercel.app`

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables in Site settings → Environment variables
7. Deploy!

### Option 3: GitHub Pages

See `.github/workflows/deploy.yml` for automatic GitHub Pages deployment.

## 🔧 Backend Deployment

The backend server needs to be deployed separately. Options:

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory to `server`
5. Add environment variables:
   - `CHAPA_SECRET_KEY`
   - `FRONTEND_URL` (your frontend URL)
   - `PORT` (optional, defaults to 5000)
6. Railway will auto-deploy on push

### Option B: Render
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy!

### Option C: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set config vars in Heroku dashboard
6. Deploy: `git push heroku main`

## 📝 Environment Variables

### Frontend (.env)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend (server/.env)
```env
CHAPA_SECRET_KEY=your_chapa_secret_key
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=5000
NODE_ENV=production
```

## 🔄 Automatic Deployment

Once set up, deployments happen automatically:
- **Frontend**: Deploys on every push to `main` branch
- **Backend**: Deploys on every push to `main` branch (if configured)

## 🧪 Testing Deployment

1. Make a small change
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Check your deployment platform dashboard
4. Wait for build to complete (usually 1-3 minutes)
5. Visit your deployed URL

## 📊 Monitoring

- **Vercel**: Check deployment logs in dashboard
- **Railway**: Check logs in service dashboard
- **GitHub Actions**: Check Actions tab in repository

## 🐛 Troubleshooting

### Build Fails
- Check build logs in deployment platform
- Verify all environment variables are set
- Ensure `package.json` scripts are correct

### Environment Variables Not Working
- Make sure variables start with `REACT_APP_` for frontend
- Restart deployment after adding variables
- Check variable names match exactly

### Backend Not Connecting
- Verify `REACT_APP_API_URL` points to deployed backend
- Check CORS settings in backend
- Verify backend is running and accessible

## 🔐 Security Notes

- Never commit `.env` files
- Use environment variables in deployment platform
- Keep secrets secure
- Use different keys for production vs development

