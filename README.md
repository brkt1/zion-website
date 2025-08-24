# Yenege Game App - MVP System

A comprehensive social gaming platform that combines QR code access, multiplayer gaming, and a sophisticated reward system for cafés and special events.

## 🎮 Overview

Yenege Game App is a revolutionary gaming platform designed to transform how people interact with games in social settings. The app supports two main gaming modes:

- **Normal Mode**: Daily gaming at cafés with QR code access
- **Game Night Mode**: Special events with tablet stations and global competition

## ✨ Key Features

### 🎯 Core Gaming Features
- **QR Code Gaming**: Scan QR codes to access games instantly at any café or event location
- **Multiplayer Mode**: Create or join game rooms to play with friends and compete together
- **Multiple Game Types**: Emoji Game, Trivia Challenge, Truth or Dare, Rock Paper Scissors
- **Real-time Competition**: Live leaderboards and instant scoring

### 🏆 Reward System
- **Café Rewards**: Set by café owners, approved by admins
- **Weekly/Monthly Rewards**: Global leaderboard competitions with countdown timers
- **Points System**: Earn points through gameplay and redeem for rewards
- **Achievement System**: Track progress and unlock special rewards

### 👥 Admin Roles & Management
- **Waiter**: Generate QR codes for players
- **Café Owner**: Set café-specific rewards and manage café operations
- **Admin**: Approve café rewards and monitor system
- **Super Admin**: Set weekly/monthly rewards and manage global leaderboards
- **Game Night Admin**: Manage event setup, location, and tablet allocations

### 💳 Payment Integration
- **Ethiopian Payment Methods**: Telebirr, CBE Birr, Credit/Debit Cards, Digital Wallets
- **Secure Transactions**: Payment verification before game start
- **Transaction History**: Complete payment tracking and management

## 🏗️ System Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for modern, responsive design
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with advanced features
- **Real-time subscriptions** for live updates
- **Row Level Security** for data protection

### Key Components
- **Authentication System**: Google OAuth integration
- **Game Engine**: Modular game system supporting multiple game types
- **QR Code System**: Dynamic QR code generation and validation
- **Leaderboard Engine**: Real-time ranking calculations
- **Reward Management**: Comprehensive reward creation and redemption system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/yenege-game-app.git
   cd yenege-game-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   ```bash
   # Run the database schema
   psql -h your_host -U your_user -d your_database -f db/yenege_game_app_schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 Usage Guide

### For Players

1. **Sign Up/Login**: Use Google OAuth for quick access
2. **Scan QR Code**: Visit a café and scan the QR code provided by waiters
3. **Choose Game Mode**: Select solo or multiplayer mode
4. **Play Games**: Enjoy various games and earn points
5. **Redeem Rewards**: Use points to get café rewards and global prizes

### For Waiters

1. **Login**: Access waiter dashboard
2. **Generate QR Codes**: Create QR codes for specific games and modes
3. **Monitor Games**: Track active game sessions
4. **Manage Players**: Assist players with game access

### For Café Owners

1. **Café Management**: Set up and manage café information
2. **Create Rewards**: Design café-specific rewards for players
3. **Analytics**: View player engagement and reward redemptions
4. **Settings**: Configure café operating hours and policies

### For Admins

1. **Reward Approval**: Review and approve café reward requests
2. **System Monitoring**: Track overall platform performance
3. **User Management**: Manage user roles and permissions
4. **Content Moderation**: Ensure quality of game content

### For Super Admins

1. **Global Rewards**: Set weekly/monthly global competitions
2. **User Role Management**: Assign and modify user roles
3. **System Configuration**: Configure platform-wide settings
4. **Analytics Dashboard**: Comprehensive platform insights

### For Game Night Admins

1. **Event Setup**: Create and configure special gaming events
2. **Tablet Allocation**: Assign tablets to specific games and locations
3. **Event Management**: Start, monitor, and end events
4. **Winner Announcement**: Declare event winners and distribute prizes

## 🎯 Game Types

### 1. Emoji Game
- **Objective**: Guess hidden emoji phrases
- **Scoring**: Points based on speed and accuracy
- **Difficulty Levels**: Easy, Medium, Hard
- **Content**: Curated emoji combinations

### 2. Trivia Challenge
- **Objective**: Answer questions across various categories
- **Scoring**: Points for correct answers, bonus for speed
- **Categories**: Geography, History, Science, Entertainment
- **Difficulty**: Adaptive based on player performance

### 3. Truth or Dare
- **Objective**: Choose between truth questions or dares
- **Modes**: Lovers mode, Friends mode
- **Scoring**: Points for completing challenges
- **Content**: Age-appropriate and culturally sensitive

### 4. Rock Paper Scissors
- **Objective**: Classic game with modern twists
- **Scoring**: Points for wins, bonus for streaks
- **Variants**: Tournament mode, team battles
- **Rewards**: Special rewards for winning streaks

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permission system
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Content sanitization

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

- **users**: User management and authentication
- **cafes**: Café information and locations
- **qr_codes**: Dynamic QR code generation
- **game_sessions**: Individual game tracking
- **game_rooms**: Multiplayer room management
- **rewards**: Reward system management
- **leaderboards**: Competition tracking
- **payment_transactions**: Financial transaction history

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Dark Theme**: Modern, eye-friendly interface
- **Smooth Animations**: Engaging user interactions
- **Intuitive Navigation**: Easy-to-use interface
- **Accessibility**: WCAG compliant design
- **Loading States**: Clear feedback for all actions

## 🔄 Real-time Features

- **Live Leaderboards**: Instant score updates
- **Game Status**: Real-time game session tracking
- **Notifications**: Instant user notifications
- **Chat System**: In-game communication
- **Live Events**: Real-time event updates

## 📈 Analytics & Reporting

- **User Analytics**: Player behavior tracking
- **Game Performance**: Game completion rates
- **Reward Analytics**: Redemption patterns
- **Café Insights**: Venue performance metrics
- **Event Reports**: Special event analytics

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production environment variables
- Set up production database
- Configure CDN for static assets
- Set up monitoring and logging

### Deployment Options
- **Vercel**: Frontend deployment
- **Supabase**: Backend and database
- **Docker**: Containerized deployment
- **AWS/GCP**: Cloud infrastructure

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
```bash
npm run test:e2e
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signin` - User sign in
- `POST /auth/signup` - User registration
- `POST /auth/signout` - User sign out

### Game Endpoints
- `POST /games/start` - Start a new game
- `GET /games/:id` - Get game details
- `PUT /games/:id/end` - End a game session

### QR Code Endpoints
- `POST /qr/generate` - Generate new QR code
- `POST /qr/scan` - Scan and validate QR code
- `PUT /qr/:id/deactivate` - Deactivate QR code

### Leaderboard Endpoints
- `GET /leaderboards/global` - Global leaderboard
- `GET /leaderboards/cafe/:id` - Café-specific leaderboard
- `GET /leaderboards/weekly` - Weekly leaderboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.yenege.com](https://docs.yenege.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/yenege-game-app/issues)
- **Discord**: [Join our community](https://discord.gg/yenege)
- **Email**: support@yenege.com

## 🗺️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Core gaming functionality
- ✅ QR code system
- ✅ Basic reward system
- ✅ Admin panels

### Phase 2 (Q2 2024)
- 🔄 Advanced analytics
- 🔄 AI-powered content generation
- 🔄 Social features
- 🔄 Mobile app

### Phase 3 (Q3 2024)
- 🔄 Blockchain integration
- 🔄 NFT rewards
- 🔄 Tournament system
- 🔄 API marketplace

### Phase 4 (Q4 2024)
- 🔄 VR/AR gaming
- 🔄 International expansion
- 🔄 Enterprise features
- 🔄 Advanced AI features

## 🙏 Acknowledgments

- **Supabase Team**: For the amazing backend platform
- **React Team**: For the powerful frontend framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For the smooth animations
- **OpenAI**: For AI content generation capabilities

---

**Built with ❤️ for the Ethiopian gaming community**

*Yenege Game App - Where Gaming Meets Social Innovation*