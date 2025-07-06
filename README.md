# Yenege GameHub: Comprehensive Project Overview

## 🚀 Project Overview

The Yenege GameHub is a modern web application designed to provide an engaging and secure gaming experience. It features a dynamic frontend built with React, a robust backend powered by Node.js and Prisma, and leverages Supabase for authentication and real-time capabilities. The platform supports various game types, manages user sessions, tracks scores, and includes an administrative panel for content and user management, as well as a dedicated dashboard for cafe owners.

## ✨ Key Features

*   **Interactive Landing Page**: Showcases available games with engaging animations and provides clear calls to action.
*   **Diverse Game Collection**: Includes Emoji Game, Truth or Dare (with Lovers/Friends modes), Trivia Challenge, and Rock Paper Scissors.
*   **Secure Game Sessions**: Timer-based sessions with persistence across browser restarts/tabs, ensuring fair play.
*   **Enhanced Card System**: Supports scanning of game cards (QR codes) to initiate sessions and manage access.
*   **Role-Based Access Control (RBAC)**: Differentiates access for Players, Cafe Owners, and Admins, ensuring secure and tailored experiences.
*   **Comprehensive Admin Panel**: Allows administrators to manage users, game content, issue certificates, and track winners.
*   **Cafe Owner Dashboard**: Provides cafe-specific insights, including card usage and local winner tracking.
*   **Robust Authentication**: Secure user login and session management via Supabase.

## 💻 Technical Stack

*   **Frontend**: React (with TypeScript), React Router DOM, Zustand (State Management), Tailwind CSS (Styling), Framer Motion (Animations).
*   **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL.
*   **Authentication & Realtime**: Supabase.

## 🌐 Architecture

The application follows a client-server architecture with a clear separation of concerns:

### Frontend (Client-Side)

The React application serves as the user interface, handling all interactions and displaying game content.

*   **Routing**: Managed by `react-router-dom`, with dynamic and protected routes.
    *   `AppRoutes.tsx`: Centralizes all route definitions.
    *   `ProtectedRoute`: Ensures users are authenticated and have an active game session for game-related content.
    *   `RoleProtectedRoute`: Enforces role-based access for sensitive areas like Admin and Cafe Owner dashboards.
*   **State Management**: Zustand stores manage global application state.
    *   `authStore.ts`: Manages user authentication status, session details, and user profile (including roles).
    *   `sessionStore.ts`: Manages active game sessions, timers, and game-specific data, with persistence via `localStorage`.
*   **Components**: Modular and reusable React components organized by feature (e.g., `Components/admin`, `Components/game`, `Components/cards`).
*   **Styling**: Tailwind CSS for utility-first styling, ensuring a consistent and modern UI.
*   **QR Scanning**: Utilizes `html5-qrcode` for client-side QR code scanning, integrated with custom UI for a modern look.

### Backend (Server-Side)

The Node.js/Express.js backend provides the API endpoints for the frontend, manages data persistence, and enforces business logic and security.

*   **Database**: PostgreSQL, managed via Prisma ORM.
*   **Authentication**: Handled by Supabase, which provides user authentication, JWT management, and row-level security.
*   **API Endpoints**: Organized by domain (e.g., `server/routes/authRoutes.js`, `server/routes/cardRoutes.js`, `server/routes/adminRoutes.js`).
*   **Middleware**: Includes authentication and authorization middleware to protect sensitive routes and ensure role-based access control.

### Database Schema (High-Level)

*   **`users`**: Supabase managed user accounts.
*   **`profiles`**: Stores user-specific data, including `role` (`USER`, `ADMIN`, `CAFE_OWNER`), linked to Supabase `users`.
*   **`game_types`**: Defines different game categories (e.g., Trivia, Truth or Dare).
*   **`cards`**: Represents physical/digital game cards, linked to `game_types`, with `used` status and `player_id`.
*   **`game_sessions`**: Tracks active game sessions, including `player_id`, `game_type_id`, `start_time`, `end_time`, `score`, `duration`.
*   **`scores`**: Stores historical game scores for players.
*   **`certificates`**: Manages game completion certificates.
*   **`rewards`**: Tracks rewards issued to winners.
*   **`cafe_owners`**: Details for cafe owner accounts.

## 🎮 Game Flow

1.  **Landing Page**: User lands on the main page, sees available games.
2.  **Login**: Users (players, cafe owners, admins) log in via the `/login` route. Authentication state and user role are managed by `authStore`.
3.  **Game Selection / Card Scan**: 
    *   Players navigate to `/game-select` to scan a game card (QR code).
    *   The `EnhancedQRScanner` processes the card data.
    *   If the card is valid and unused, it determines the `gameTypeId` and `routeAccess`.
4.  **Session Initiation**: Upon selecting a game from the scanned card, `sessionStore` initiates a new game session, setting the timer and `gameTypeId`.
5.  **Protected Game Play**: 
    *   `ProtectedRoute` ensures an active session and redirects if not present.
    *   The system verifies if the `gameTypeId` of the active session matches the requested game route. If not, the user is redirected to a "Wrong Game Type" page.
    *   The `GameTimer` component displays the remaining time, which persists even if the user navigates away or restarts the browser.
6.  **Game Completion**: When the timer expires or the game concludes, the session ends, and the score is saved via the backend API.
7.  **Role-Based Access**: 
    *   **Admin**: Can access `/admin` (protected by `RoleProtectedRoute` for `ADMIN` role).
    *   **Cafe Owner**: Can access `/cafe-owner/dashboard` (protected by `RoleProtectedRoute` for `CAFE_OWNER` or `ADMIN` roles).
    *   **Players**: Can access game-related routes and general user features.

## 🛠️ Setup and Running

### Prerequisites

*   Node.js (LTS recommended)
*   npm or Yarn
*   PostgreSQL database
*   Supabase project (with configured authentication and database tables)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd zion-website
    ```
2.  **Install Frontend Dependencies**:
    ```bash
    npm install # or yarn install
    ```
3.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install # or yarn install
    cd ..
    ```
4.  **Environment Variables**:
    Create a `.env` file in the project root and in the `server/` directory based on `.env.example` files.
    *   **Frontend `.env`**:
        ```
        VITE_SUPABASE_URL=your_supabase_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```
    *   **Backend `server/.env`**:
        ```
        DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
        SUPABASE_URL=your_supabase_url
        SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
        JWT_SECRET=a_strong_random_secret_key
        ```
5.  **Database Setup (Backend)**:
    *   Ensure your PostgreSQL database is running.
    *   Run Prisma migrations to set up the database schema:
        ```bash
        cd server
        npx prisma migrate dev --name init
        cd ..
        ```
    *   (Optional) Seed your database with initial data if you have a seeding script.

### Running the Application

To start both the frontend and backend servers:

```bash
npm run dev # This script should start both frontend (Vite) and backend (Node.js)
```

*   The frontend will typically run on `http://localhost:5173` (or similar).
*   The backend API will run on `http://localhost:3001`.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.

## 📄 License

[Specify your project's license here, e.g., MIT, Apache 2.0]

---

### API Minimum Viable Product (MVP) for Front-End Functionality

**Base URL**: `http://localhost:3001/api`

**General Considerations**:
*   **Authentication**: All protected endpoints (marked with 🔒) require a valid JWT `Authorization: Bearer <token>` header. The token is obtained via the `/auth/login` endpoint.
*   **Error Handling**: All endpoints should return consistent error responses, typically with a `4xx` or `5xx` status code and a JSON body like:
    ```json
    {
      "message": "Error description",
      "code": "OPTIONAL_ERROR_CODE"
    }
    ```
*   **Data Validation**: The backend should perform robust validation on all incoming request data.

---

#### 1. Authentication & User Management

**1.1. Login**
*   **Endpoint**: `POST /auth/login`
*   **Description**: Authenticates a user with email and password, returning a session token and user details.
*   **Request**:
    *   **Headers**: `Content-Type: application/json`
    *   **Body**:
        ```json
        {
          "email": "string",
          "password": "string"
        }
        ```
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "session": {
            "access_token": "string",
            "refresh_token": "string",
            "expires_in": "number",
            "token_type": "Bearer",
            "user": {
              "id": "string",
              "email": "string",
              "created_at": "string",
              "updated_at": "string"
            }
          },
          "profile": {
            "id": "string",
            "userId": "string",
            "role": "USER" | "ADMIN" | "CAFE_OWNER",
            "createdAt": "string",
            "updatedAt": "string"
          }
        }
        ```
    *   **Error (401 Unauthorized)**: Invalid credentials.

**1.2. Get User Profile 🔒**
*   **Endpoint**: `GET /profile`
*   **Description**: Retrieves the authenticated user's profile, including their role.
*   **Request**:
    *   **Headers**: `Authorization: Bearer <token>`
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "id": "string",
          "userId": "string",
          "role": "USER" | "ADMIN" | "CAFE_OWNER",
          "createdAt": "string",
          "updatedAt": "string"
        }
        ```
    *   **Error (401 Unauthorized)**: Invalid or missing token.
    *   **Error (404 Not Found)**: Profile not found for the user.

**1.3. Logout 🔒**
*   **Endpoint**: `POST /auth/logout`
*   **Description**: Invalidates the current user session.
*   **Request**:
    *   **Headers**: `Authorization: Bearer <token>`
*   **Response**:
    *   **Success (204 No Content)**
    *   **Error (401 Unauthorized)**: Invalid or missing token.

---

#### 2. Game Session Management

**2.1. Save Game Score 🔒**
*   **Endpoint**: `POST /scores`
*   **Description**: Saves a player's game score to the database.
*   **Request**:
    *   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Body**:
        ```json
        {
          "playerName": "string",
          "playerId": "string",
          "score": "number",
          "stage": "number",
          "sessionId": "string",
          "streak": "number",
          "gameTypeId": "string"
        }
        ```
*   **Response**:
    *   **Success (201 Created)**:
        ```json
        {
          "message": "Score saved successfully",
          "scoreId": "string"
        }
        ```
    *   **Error (400 Bad Request)**: Invalid input data.
    *   **Error (401 Unauthorized)**: Invalid or missing token.

---

#### 3. Card Management

**3.1. Get Card Details**
*   **Endpoint**: `GET /cards/{cardNumber}`
*   **Description**: Retrieves details for a specific game card, used as a fallback for manual entry.
*   **Request**: None (card number in path)
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "cardNumber": "string",
          "gameTypeId": "string",
          "duration": "number",
          "routeAccess": ["string"],
          "used": "boolean",
          "playerId": "string | null",
          "usedAt": "string | null"
        }
        ```
    *   **Error (404 Not Found)**: Card not found.

**3.2. Mark Card as Used 🔒**
*   **Endpoint**: `PUT /cards/{cardNumber}/use`
*   **Description**: Marks a specific card as used and assigns a player ID.
*   **Request**:
    *   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Body**:
        ```json
        {
          "playerId": "string"
        }
        ```
*   **Response**: 
    *   **Success (200 OK)**:
        ```json
        {
          "message": "Card marked as used successfully"
        }
        ```
    *   **Error (400 Bad Request)**: Card already used or invalid player ID.
    *   **Error (401 Unauthorized)**: Invalid or missing token.
    *   **Error (404 Not Found)**: Card not found.

---

#### 4. Admin & Cafe Owner Functionality

**4.1. Admin Dashboard Data 🔒**
*   **Endpoint**: `GET /admin/dashboard`
*   **Description**: Retrieves data necessary for the admin dashboard. (Specific data points to be defined based on dashboard content).
*   **Request**:
    *   **Headers**: `Authorization: Bearer <token>`
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "totalUsers": "number",
          "activeSessions": "number",
          "recentActivities": [
            {
              "id": "string",
              "type": "string",
              "description": "string",
              "timestamp": "string"
            }
          ],
          "userRoles": [
            {
              "userId": "string",
              "email": "string",
              "role": "USER" | "ADMIN" | "CAFE_OWNER"
            }
          ]
          // ... other admin-specific data
        }
        ```
    *   **Error (401 Unauthorized)**: Invalid or missing token.
    *   **Error (403 Forbidden)**: User does not have ADMIN role.

**4.2. Cafe Owner Dashboard Data 🔒**
*   **Endpoint**: `GET /cafe-owner/dashboard`
*   **Description**: Retrieves data specific to the cafe owner dashboard. (Specific data points to be defined based on dashboard content).
*   **Request**:
    *   **Headers**: `Authorization: Bearer <token>`
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "cafeName": "string",
          "totalCardsScanned": "number",
          "activeGames": "number",
          "recentWinners": [
            {
              "winnerId": "string",
              "playerName": "string",
              "gameType": "string",
              "reward": "string",
              "timestamp": "string"
            }
          ],
          "cardUsageStats": {
            "used": "number",
            "available": "number"
          }
        }
        ```
    *   **Error (401 Unauthorized)**: Invalid or missing token.
    *   **Error (403 Forbidden)**: User does not have CAFE_OWNER or ADMIN role.

---