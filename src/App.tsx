import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { GameProvider } from './contexts/GameContext';
import { LeaderboardProvider } from './contexts/LeaderboardContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { RewardProvider } from './contexts/RewardContext';

// Landing and Auth
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GameSelection from './pages/game/GameSelection';
import QRScanner from './pages/game/QRScanner';

// Game Components
import EmojiGame from './pages/games/EmojiGame';
import RockPaperScissorsGame from './pages/games/RockPaperScissorsGame';
import TriviaGame from './pages/games/TriviaGame';
import TruthOrDareGame from './pages/games/TruthOrDareGame';

// Multiplayer Components
import GameRoom from './pages/multiplayer/GameRoom';
import RoomCreation from './pages/multiplayer/RoomCreation';
import RoomJoining from './pages/multiplayer/RoomJoining';

// Admin Panels
import AdminDashboard from './pages/admin/AdminDashboard';
import CafeOwnerDashboard from './pages/admin/CafeOwnerDashboard';
import GameNightAdminDashboard from './pages/admin/GameNightAdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import WaiterDashboard from './pages/admin/WaiterDashboard';

// User Components
import GameHistory from './pages/user/GameHistory';
import Leaderboard from './pages/user/Leaderboard';
import Rewards from './pages/user/Rewards';
import UserProfile from './pages/user/UserProfile';

// Event Components
import EventLocation from './pages/events/EventLocation';
import GameNightSetup from './pages/events/GameNightSetup';
import TabletStation from './pages/events/TabletStation';

// Payment Components
import PaymentGateway from './pages/payment/PaymentGateway';
import PaymentVerification from './pages/payment/PaymentVerification';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Error and Loading
import ErrorBoundary from './components/utility/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <PaymentProvider>
            <AdminProvider>
              <EventProvider>
                <LeaderboardProvider>
                  <RewardProvider>
                    <Router>
                      <div className="App">
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<Landing />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          
                          {/* Protected Game Routes */}
                          <Route path="/scan" element={
                            <ProtectedRoute>
                              <QRScanner />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/games" element={
                            <ProtectedRoute>
                              <GameSelection />
                            </ProtectedRoute>
                          } />
                          
                          {/* Individual Game Routes */}
                          <Route path="/game/emoji" element={
                            <ProtectedRoute>
                              <EmojiGame />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/game/trivia" element={
                            <ProtectedRoute>
                              <TriviaGame />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/game/truth-dare" element={
                            <ProtectedRoute>
                              <TruthOrDareGame />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/game/rock-paper-scissors" element={
                            <ProtectedRoute>
                              <RockPaperScissorsGame />
                            </ProtectedRoute>
                          } />
                          
                          {/* Multiplayer Routes */}
                          <Route path="/multiplayer/create" element={
                            <ProtectedRoute>
                              <RoomCreation />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/multiplayer/join" element={
                            <ProtectedRoute>
                              <RoomJoining />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/room/:roomId" element={
                            <ProtectedRoute>
                              <GameRoom />
                            </ProtectedRoute>
                          } />
                          
                          {/* Admin Routes */}
                          <Route path="/admin/waiter" element={
                            <RoleBasedRoute allowedRoles={['waiter', 'cafe_owner', 'admin', 'super_admin']}>
                              <WaiterDashboard />
                            </RoleBasedRoute>
                          } />
                          
                          <Route path="/admin/cafe-owner" element={
                            <RoleBasedRoute allowedRoles={['cafe_owner', 'admin', 'super_admin']}>
                              <CafeOwnerDashboard />
                            </RoleBasedRoute>
                          } />
                          
                          <Route path="/admin/admin" element={
                            <RoleBasedRoute allowedRoles={['admin', 'super_admin']}>
                              <AdminDashboard />
                            </RoleBasedRoute>
                          } />
                          
                          <Route path="/admin/super-admin" element={
                            <RoleBasedRoute allowedRoles={['super_admin']}>
                              <SuperAdminDashboard />
                            </RoleBasedRoute>
                          } />
                          
                          <Route path="/admin/game-night" element={
                            <RoleBasedRoute allowedRoles={['game_night_admin', 'super_admin']}>
                              <GameNightAdminDashboard />
                            </RoleBasedRoute>
                          } />
                          
                          {/* User Routes */}
                          <Route path="/profile" element={
                            <ProtectedRoute>
                              <UserProfile />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/leaderboard" element={<Leaderboard />} />
                          <Route path="/rewards" element={
                            <ProtectedRoute>
                              <Rewards />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/history" element={
                            <ProtectedRoute>
                              <GameHistory />
                            </ProtectedRoute>
                          } />
                          
                          {/* Event Routes */}
                          <Route path="/events/setup" element={
                            <RoleBasedRoute allowedRoles={['game_night_admin', 'super_admin']}>
                              <GameNightSetup />
                            </RoleBasedRoute>
                          } />
                          
                          <Route path="/events/location/:locationId" element={<EventLocation />} />
                          <Route path="/station/:stationId" element={<TabletStation />} />
                          
                          {/* Payment Routes */}
                          <Route path="/payment" element={
                            <ProtectedRoute>
                              <PaymentGateway />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/payment/verify" element={
                            <ProtectedRoute>
                              <PaymentVerification />
                            </ProtectedRoute>
                          } />
                          
                          {/* Fallback */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </Router>
                  </RewardProvider>
                </LeaderboardProvider>
              </EventProvider>
            </AdminProvider>
          </PaymentProvider>
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
