# Deployment Checklist

This checklist ensures your application is ready for production deployment.

## Pre-Deployment Setup

### 1. Database Setup

- [ ] Run `docs/scripts/create-visits-table.sql` in Supabase SQL Editor
- [ ] Run `docs/scripts/create-push-subscriptions-table.sql` in Supabase SQL Editor
- [ ] Verify all existing SQL scripts are applied (check `docs/scripts/` directory)

### 2. Environment Variables

#### Frontend (.env or environment variables in hosting platform)

```env
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key (optional, will be fetched from backend)
```

#### Backend (server/.env or environment variables in hosting platform)

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.yenege.com

# Supabase
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@yenege.com

# Payment Gateway
CHAPA_SECRET_KEY=your-chapa-secret-key

# WhatsApp (Optional)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

### 3. Generate VAPID Keys

```bash
cd server
npm run generate-vapid
```

Add the generated keys to your backend environment variables.

### 4. Build Verification

- [x] Frontend builds successfully: `npm run build`
- [x] Backend builds successfully: `cd server && npm run build`
- [x] TypeScript type checking passes: `npm run type-check`
- [x] No critical linting errors

### 5. Service Worker

- [x] Service worker is registered
- [x] Service worker handles push notifications
- [x] Offline page exists (`public/offline.html`)

### 6. PWA Configuration

- [x] `manifest.json` is configured
- [x] Icons are generated (192x192 and 512x512)
- [x] Service worker is properly configured

## Deployment Steps

### Frontend Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `build/` folder** to your hosting platform:
   - Netlify: Connect GitHub repo or drag & drop `build/` folder
   - Vercel: `npm run deploy:vercel` or connect GitHub repo
   - Railway: Configure build command and output directory
   - Any static hosting: Upload `build/` folder contents

3. **Configure environment variables** in your hosting platform

4. **Set up redirects** (if needed):
   - All routes should redirect to `index.html` for client-side routing
   - See `netlify.toml` or `vercel.json` for examples

### Backend Deployment

1. **Build the backend:**
   ```bash
   cd server
   npm run build
   ```

2. **Deploy to your hosting platform:**
   - Railway: Connect GitHub repo, set root directory to `server/`
   - Render: Connect GitHub repo, set root directory to `server/`
   - Heroku: Use `server/` as root directory
   - Any Node.js hosting: Deploy `server/` directory

3. **Configure environment variables** in your hosting platform

4. **Set up health check endpoint:**
   - Configure: `GET /api/health`
   - This endpoint should return `{ status: 'ok' }`

## Post-Deployment Verification

### 1. Frontend Checks

- [ ] Website loads correctly
- [ ] All pages are accessible
- [ ] Service worker is registered (check browser DevTools > Application > Service Workers)
- [ ] PWA can be installed
- [ ] Push notifications permission can be requested
- [ ] All API calls work correctly

### 2. Backend Checks

- [ ] Health check endpoint works: `GET /api/health`
- [ ] Payment endpoints are accessible
- [ ] Push notification endpoints are accessible
- [ ] CORS is configured correctly
- [ ] Rate limiting is working

### 3. Feature Testing

- [ ] Events can be created in admin panel
- [ ] Push notifications are sent when new events are created
- [ ] Users receive notifications even when app is closed
- [ ] Payment flow works end-to-end
- [ ] Ticket verification works
- [ ] Visit tracking is working (check admin dashboard)

### 4. Security Checks

- [ ] HTTPS is enabled (required for PWA and push notifications)
- [ ] Environment variables are not exposed in client-side code
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Sensitive keys are stored securely

## Troubleshooting

### Push Notifications Not Working

1. Verify VAPID keys are set correctly
2. Check that HTTPS is enabled (required for push)
3. Verify service worker is registered
4. Check browser console for errors
5. Verify `push_subscriptions` table exists in database

### Build Errors

1. Run `npm install` in both root and `server/` directories
2. Clear `node_modules` and reinstall if needed
3. Check Node.js version (requires >= 16.0.0)
4. Verify all environment variables are set

### Deployment Issues

1. Check build logs in your hosting platform
2. Verify environment variables are set correctly
3. Check that build commands are correct
4. Verify output directories are configured correctly

## Quick Deploy Commands

### Frontend
```bash
npm run build
# Then deploy build/ folder to your hosting platform
```

### Backend
```bash
cd server
npm run build
# Then deploy server/ directory to your hosting platform
```

### Full Deployment
```bash
# Frontend
npm run build

# Backend
cd server && npm run build

# Deploy both to your hosting platforms
```

## Notes

- Push notifications require HTTPS in production
- Service worker requires HTTPS (except localhost)
- VAPID keys must be generated and kept secure
- Database migrations must be run before deployment
- Environment variables must be set in hosting platform
