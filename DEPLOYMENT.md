# Yenege Game App - Deployment Guide

This guide provides comprehensive instructions for deploying the Yenege Game App to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Git
- Supabase account
- Environment variables configured

### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/your-username/yenege-game-app.git
cd yenege-game-app

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Configure your environment variables
# Edit .env with your Supabase credentials

# Start development server
npm start
```

## 🌐 Environment Configuration

### Required Environment Variables
Create a `.env` file in the root directory:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
REACT_APP_APP_NAME=Yenege Game App
REACT_APP_APP_VERSION=1.0.0
REACT_APP_APP_ENV=production

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PAYMENTS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_REALTIME=true
```

### Supabase Setup
1. Create a new Supabase project
2. Run the database schema from `db/yenege_game_app_schema.sql`
3. Configure authentication providers (Google OAuth)
4. Set up storage buckets for user avatars and game assets
5. Configure Row Level Security (RLS) policies

## 🏗️ Build Process

### Production Build
```bash
# Create production build
npm run build

# Test production build locally
npm install -g serve
serve -s build -l 3000
```

### Build Optimization
The build process includes:
- Code splitting and lazy loading
- Tree shaking for unused code
- Minification and compression
- Service worker for PWA functionality
- Optimized assets and images

## 🚀 Deployment Options

### 1. Vercel (Recommended)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to configure your project
```

#### Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "env": {
    "REACT_APP_SUPABASE_URL": "@supabase-url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase-key"
  }
}
```

#### Environment Variables
Set in Vercel dashboard:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- Other environment variables

### 2. Netlify

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS S3 + CloudFront

#### Setup
```bash
# Install AWS CLI
# Configure AWS credentials

# Create S3 bucket
aws s3 mb s3://your-yenege-app-bucket

# Upload build files
aws s3 sync build/ s3://your-yenege-app-bucket --delete

# Configure CloudFront distribution
# Set origin to S3 bucket
# Configure custom domain and SSL certificate
```

#### S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-yenege-app-bucket/*"
    }
  ]
}
```

### 4. Firebase Hosting

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

#### Configuration
`firebase.json`:
```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5. Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
`nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    }
}
```

#### Docker Commands
```bash
# Build image
docker build -t yenege-game-app .

# Run container
docker run -p 80:80 yenege-game-app

# Docker Compose
docker-compose up -d
```

## 🔧 Production Optimizations

### Performance
- Enable gzip compression
- Configure CDN for static assets
- Implement lazy loading for routes
- Optimize images and assets
- Enable HTTP/2

### Security
- Set security headers
- Enable HTTPS
- Configure CSP (Content Security Policy)
- Implement rate limiting
- Regular security updates

### Monitoring
- Set up error tracking (Sentry)
- Configure analytics (Google Analytics)
- Monitor performance metrics
- Set up uptime monitoring
- Configure logging

## 📱 PWA Configuration

### Service Worker
The app includes a service worker for:
- Offline functionality
- App-like experience
- Background sync
- Push notifications

### Manifest
- Configure app icons
- Set theme colors
- Define app shortcuts
- Configure display mode

## 🗄️ Database Deployment

### Supabase Production
1. Create production project
2. Run migration scripts
3. Configure backup policies
4. Set up monitoring
5. Configure alerts

### Alternative Databases
- PostgreSQL on AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- Self-hosted PostgreSQL

## 🔐 SSL/TLS Configuration

### Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom Domain Setup
1. Configure DNS records
2. Set up SSL certificate
3. Configure redirects
4. Test HTTPS functionality

## 📊 Analytics & Monitoring

### Google Analytics
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry Error Tracking
```bash
npm install @sentry/react @sentry/tracing
```

### Performance Monitoring
- Core Web Vitals
- Lighthouse scores
- Real User Monitoring (RUM)
- Custom performance metrics

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version and dependencies
2. **Environment Variables**: Verify all required variables are set
3. **Database Connection**: Check Supabase configuration
4. **CORS Issues**: Configure Supabase CORS settings
5. **PWA Issues**: Verify manifest and service worker

### Debug Commands
```bash
# Check build output
npm run build --verbose

# Analyze bundle
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'

# Check environment
echo $REACT_APP_SUPABASE_URL
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancers
- Multiple server instances
- Database read replicas
- CDN distribution

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies
- Use connection pooling

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Automated Testing
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security tests

## 📚 Additional Resources

- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS Documentation](https://aws.amazon.com/documentation/)

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section
2. Review logs and error messages
3. Verify configuration settings
4. Check documentation links
5. Create an issue in the repository

---

**Happy Deploying! 🎮✨**
