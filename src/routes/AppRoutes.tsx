import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AccessDenied from "../Components/utility/AccessDenied";
import LoadingSpinner from "../Components/utility/LoadingSpinner";
import WrongGameType from "../Components/utility/WrongGameType";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";

// Lazy-loaded components
const Lovers = lazy(() => import("../TruthandDear-Component/Lovers"));
const ThankYou = lazy(() => import("../Components/utility/ThankYou"));
const RockPaperScissors = lazy(
  () => import("../Components/game/RockPaperScissors")
);
const Friends = lazy(() => import("../TruthandDear-Component/Friends"));
const LoveGameMode = lazy(
  () => import("../TruthandDear-Component/LoveGameMode")
);
const FriendsGameMode = lazy(
  () => import("../TruthandDear-Component/FriendsGameMode")
);
const GameScreen = lazy(() => import("../Components/game/GameScreen"));
const TruthOrDare = lazy(() => import("../TruthandDear-Component/TruthOrDare"));
const EmojiGame = lazy(() => import("../Emoji-Component/EmojiGame"));

const Landing = lazy(() => import("../MainLanding"));
const TriviaGame = lazy(() => import("../Triva-Component/Trivia"));
const CafeOwnerDashboard = lazy(
  () => import("../Components/admin/CafeOwnerDashboard")
);
const Admin = lazy(() => import("../Components/admin/AdminPanel"));
const SuperAdminPanel = lazy(
  () => import("../Components/admin/SuperAdminPanel")
);
const Login = lazy(() => import("../Components/auth/Login"));

// Enhanced Card System Components
const EnhancedCardGenerator = lazy(
  () => import("../Components/cards/EnhancedCardGenerator")
);
const EnhancedQRScanner = lazy(
  () => import("../Components/cards/EnhancedQRScanner")
);
const WinnerCardGenerator = lazy(
  () => import("../Components/cards/WinnerCardGenerator")
);
const WinnerCardScanner = lazy(
  () => import("../Components/cards/WinnerCardScanner")
);
const GameResult = lazy(() => import("../Components/game/GameResult"));

interface ProtectedRouteProps {
  children: React.ReactElement;
}

// Map routes to their expected gameTypeIds
const gameTypeRoutes: { [key: string]: string } = {
  "/lovers": "TRUTH_OR_DARE",
  "/friends": "TRUTH_OR_DARE",
  "/game-mode": "TRUTH_OR_DARE",
  "/friends-game-mode": "TRUTH_OR_DARE",
  "/truth-or-dare": "TRUTH_OR_DARE",
  "/trivia-game": "TRIVIA",
  "/rock-paper-scissors": "ROCK_PAPER_SCISSORS",
  "/emoji-game": "EMOJI_GAME",
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { currentSession, isTimerActive } = useSessionStore();
  const { session } = useAuthStore();

  // If it's a game-related route, check for active session and game type
  if (gameTypeRoutes[location.pathname]) {
    if (!currentSession?.isActive || !isTimerActive) {
      return <Navigate to="/game-select" replace state={{ fromGame: true }} />;
    }

    // Check if the game type matches the session's game type
    if (currentSession.gameTypeId !== gameTypeRoutes[location.pathname]) {
      return (
        <Navigate
          to="/wrong-game-type"
          replace
          state={{ expectedGameType: gameTypeRoutes[location.pathname] }}
        />
      );
    }
  } else if (!session) {
    // For non-game routes, require a session
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return React.cloneElement(children, {
    ...location.state,
  });
};

interface RoleProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: Array<"ADMIN" | "CAFE_OWNER" | "USER" | "SUPER_ADMIN">;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { session, profile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />; // Or some other loading indicator
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const profileRoleString = String(profile?.role || "").trim();
  const allowedRolesStrings = allowedRoles.map((role) => String(role).trim());

  if (
    !profile ||
    !profile.role ||
    !allowedRolesStrings.includes(profileRoleString)
  ) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Landing />} />
      <Route path="/game-select" element={<EnhancedQRScanner />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/wrong-game-type" element={<WrongGameType />} />
      <Route path="/game-result" element={<GameResult />} />
      <Route
        path="/lovers"
        element={
          <ProtectedRoute>
            <Lovers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game-mode"
        element={
          <ProtectedRoute>
            <LoveGameMode />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends-game-mode"
        element={
          <ProtectedRoute>
            <FriendsGameMode />
          </ProtectedRoute>
        }
      />
      <Route
        path="/game-screen"
        element={
          <ProtectedRoute>
            <GameScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-scan"
        element={
          <ProtectedRoute>
            <EnhancedQRScanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <Admin />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN"]}>
            <Admin />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/super-admin"
        element={
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminPanel />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/trivia-game"
        element={
          <ProtectedRoute>
            <TriviaGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/truth-or-dare"
        element={
          <ProtectedRoute>
            <TruthOrDare />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rock-paper-scissors"
        element={
          <ProtectedRoute>
            <RockPaperScissors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emoji-game"
        element={
          <ProtectedRoute>
            <EmojiGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cafe-owner/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["CAFE_OWNER", "ADMIN"]}>
            <CafeOwnerDashboard />
          </RoleProtectedRoute>
        }
      />

      {/* Enhanced Card System Routes */}
      <Route
        path="/enhanced-card-generator"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <EnhancedCardGenerator />
          </RoleProtectedRoute>
        }
      />
      <Route path="/enhanced-scanner" element={<EnhancedQRScanner />} />
      <Route
        path="/winner-card-scanner"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <WinnerCardScanner />
          </RoleProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRoutes;
