import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AccessDenied from "../Components/utility/AccessDenied";
import LoadingSpinner from "../Components/utility/LoadingSpinner";
import WrongGameType from "../Components/utility/WrongGameType";
import { useAuthStore } from "../stores/authStore";

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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session } = useAuthStore();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
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

  if (loading || !profile) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Safety check to ensure profile.role is a valid string
  const userRole = profile?.role;
  if (!userRole || typeof userRole !== 'string') {
    console.warn('Invalid profile role:', userRole, 'Profile:', profile);
    return <Navigate to="/access-denied" replace />;
  }

  const hasPermission = allowedRoles.includes(userRole as any);

  if (!hasPermission) {
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

      {/* Games */}
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

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <Admin />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/super-admin/*"
        element={
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminPanel />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/cafe-owner/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["CAFE_OWNER"]}>
            <CafeOwnerDashboard />
          </RoleProtectedRoute>
        }
      />

      {/* Enhanced Card System Routes */}
      <Route path="/enhanced-scanner" element={<EnhancedQRScanner />} />
      <Route path="/qr-scan" element={<EnhancedQRScanner />} />
      <Route
        path="/enhanced-card-generator"
        element={<EnhancedCardGenerator />}
      />
      <Route path="/winner-card-scanner" element={<WinnerCardScanner />} />
      <Route path="/winner-card-generator" element={<WinnerCardGenerator />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
