# Yenege GameHub: Web MVP Overview

## 1. Frontend Game Hub

### Core Features
- **Landing Page:**
  - Showcase of 4 premium games: Emoji Game, Truth or Dare, Trivia Challenge, Rock Paper Scissors
  - Animated game cards with labels/icons
  - 'Launch App' button with custom URL scheme and fallback to app store
- **Game Session Management:**
  - Timer-based sessions with countdown
  - Auto redirect on expiration
  - Protected routes via React Router
- **Game Modes & Components:**
  - Screens: Lovers/Friends modes
  - Components: LoveGameMode, FriendsGameMode, GameScreen, TriviaGame, TruthOrDare, EmojiGame
  - Responsive UI + animations
- **Authentication:**
  - Integrated login for players/café owners
  - Session persistence

## 2. Backend & Admin Panel

### Technical Stack
- **Backend:** Prisma ORM + PostgreSQL
- **Auth/Realtime:** Supabase

### Data Models
- **GameType** → Card, Question, Score
- **Player** → Certificate, Reward
- **CafeOwner** → Payment

#### Database
- Game sessions: Card, Question, Emoji tables
- Player progress: PlayerProgress, EmojiPlayerProgress
- Rewards: Certificate, Reward, Payment
- Café management: CafeOwner model

### Admin Panel Features
- **Role-Based Access Control:**
  - Admin: Full control
  - CafeOwner: Limited access (local rewards/sessions)
- **Management Tabs:**
  - Certificates: Issue/verify credentials (Admin+Cafe)
  - Café Owners: Manage café accounts (Admin)
  - Card Gen: Create reward/payment cards (Admin)
  - Winners: List prize recipients (Admin+Cafe)
- **UI Components:**
  - Secure sidebar
  - Real-time data tables
  - One-click login/logout

## Key MVP Achievements
1. **Premium Player Experience:**
   - Ad-free, exclusive games
   - Seamless navigation and timer-based sessions
2. **Robust Admin Control:**
   - Granular role separation
   - Full certificate and reward tracking
3. **Scalable Backend:**
   - PostgreSQL + Supabase integration
   - Real-time updates and auth
4. **Café Ecosystem:**
   - Café-specific access
   - Localized session and reward handling

## Deployment Ready
- **Frontend:** React + Vite
- **Backend:** Node.js/Express with Prisma
- **Hosting:** Vercel/Netlify (Frontend) + Supabase (Backend)

### Sample Startup
```bash
$ npm run dev # Starts frontend + backend servers and checks all the code components
```

---

For more details, see the security documentation in `src/utils/SECURITY.md` and the codebase for implementation specifics.
