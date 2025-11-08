# Website

A modern lifestyle & events platform built with React and TypeScript.

## 🎯 Overview

YENEGE is a digital home for happiness, where people can:
- Discover upcoming events & trips
- Register or buy tickets
- See photos/videos from past events
- Learn about the Yenege story
- Connect and join the community

## 📁 Project Structure

```
zion-website/
├── src/
│   ├── pages/
│   │   ├── Home.tsx          # Landing page with hero, categories, and CTAs
│   │   ├── Events.tsx        # Events listing with filters
│   │   ├── EventDetail.tsx   # Individual event page with payment
│   │   ├── PaymentSuccess.tsx # Payment success page
│   │   ├── PaymentCallback.tsx # Payment callback handler
│   │   ├── About.tsx         # Company story, mission, and values
│   │   └── Contact.tsx       # Contact form and information
│   ├── Components/
│   │   └── layout/
│   │       ├── Header.tsx    # Navigation header
│   │       ├── Footer.tsx    # Site footer
│   │       └── Layout.tsx    # Main layout wrapper
│   ├── services/
│   │   └── payment.ts        # Payment API service
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── App.tsx               # Main app with routing
└── server/
    ├── src/
    │   ├── routes/
    │   │   └── payment.ts    # Payment API routes
    │   ├── services/
    │   │   └── chapa.ts      # Chapa SDK service
    │   └── index.ts          # Express server
    └── package.json          # Backend dependencies
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## 📄 Pages

### Core Pages (Implemented)
- **Home** (`/`) - Hero section, event categories, featured events
- **Events** (`/events`) - Event listing with search and filters
- **Event Detail** (`/events/:id`) - Individual event page with booking
- **About** (`/about`) - Company story, mission, vision, values
- **Contact** (`/contact`) - Contact form, location, social links

### Future Pages (To be added)
- **Travel** (`/travel`) - Travel adventures and trips
- **Community** (`/community`) - Community stories and testimonials
- **Gallery** (`/gallery`) - Photo and video gallery

## 🎨 Design System

- **Primary Colors**: Amber/Orange gradient
- **Typography**: Inter font family
- **Framework**: Tailwind CSS
- **Icons**: React Icons (Font Awesome)

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: react-icons
- **Build Tool**: Vite (or Create React App)

## 📱 Features

- ✅ Responsive design (mobile-first)
- ✅ Modern UI with smooth animations
- ✅ Event filtering and search
- ✅ Social media integration
- ✅ Contact form
- ✅ SEO-friendly structure
- ✅ **Chapa Payment Integration** - Accept payments for event tickets
- ✅ Payment verification and webhook support
- ✅ Payment success/failure handling

## 🔗 Contact Information

- **Email**: bereketyosef49@gmail.com
- **Phone**: +251 978 639 887
- **Location**: Addis Ababa, Ethiopia

## 💳 Payment Integration

Chapa payment integration is now fully implemented! See [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) for detailed setup instructions.

### Quick Start

1. **Backend Setup:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Add your Chapa secret key to .env
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   # In root directory
   cp env.example .env
   # Add REACT_APP_API_URL=http://localhost:5000/api
   npm start
   ```

## 📝 Next Steps

1. ✅ ~~Implement payment integration (Chapa)~~ - **COMPLETED**
2. Connect to backend API for events data
3. Add user authentication
4. Create admin dashboard for event management
5. Add blog/stories section
6. Implement gallery with image optimization

## 📄 License

MIT

