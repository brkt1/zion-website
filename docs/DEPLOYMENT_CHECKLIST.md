# Deployment Checklist

## Pre-Deployment Security

- ✅ All sensitive files removed from repository
- ✅ Documentation files moved/removed (except README.md)
- ✅ SQL scripts moved to `docs/scripts/`
- ✅ Test files removed
- ✅ Setup scripts removed
- ✅ `.gitignore` updated to prevent sensitive files

## Environment Variables

### Frontend (Vercel)
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_URL`
- `REACT_APP_RECAPTCHA_SITE_KEY`

### Backend (Render/Railway/etc)
- `FRONTEND_URL`
- `CHAPA_SECRET_KEY`
- `RECAPTCHA_SECRET_KEY`
- `NODE_ENV=production`

## Deployment Steps

1. **Verify Environment Variables**
   - Check all required variables are set in hosting platforms
   - Never commit `.env` files

2. **Build & Test Locally**
   ```bash
   npm run build
   ```

3. **Deploy Frontend**
   - Push to main branch (auto-deploys on Vercel)
   - Or use: `npm run deploy:vercel`

4. **Deploy Backend**
   - Push to main branch (auto-deploys on Render/Railway)
   - Or manually deploy via dashboard

5. **Verify Deployment**
   - Test payment flow
   - Test contact form
   - Check reCAPTCHA is working
   - Verify all API endpoints

## Security Notes

- All API keys and secrets must be in environment variables
- Never commit sensitive information
- Use `.env.example` as template only
- SQL scripts are in `docs/scripts/` for reference only

