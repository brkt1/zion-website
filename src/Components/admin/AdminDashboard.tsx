import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import LoadingSpinner from "../utility/LoadingSpinner";
import DashboardStats from "./DashboardStats";

// Type for mapping routes to React components or render functions
type RouteMap = {
  [route: string]: React.ComponentType<any> | (() => JSX.Element);
};

// Lazy-load admin components using dynamic import syntax
const AdminComponents = {
  CafeOwnerDashboard: React.lazy(() => import("./CafeOwnerDashboard")),
  CafeOwnerManagement: React.lazy(() => import("./CafeOwnerManagement")),
  CertificatesTable: React.lazy(() => import("./CertificatesTable")),
  GameTypesTable: React.lazy(() => import("./GameTypesTable")),
  RewardWinner: React.lazy(() => import("./RewardWinner")),
  UsersTable: React.lazy(() => import("./UsersTable")),
  WinnerList: React.lazy(() => import("./WinnerList")),
  WinnerScanner: React.lazy(() => import("./WinnerScanner")),
  EnhancedCardGenerator: React.lazy(
    () => import("../cards/EnhancedCardGenerator")
  ),
  EnhancedQRScanner: React.lazy(() => import("../cards/EnhancedQRScanner")),
  WinnerCardGenerator: React.lazy(() => import("../cards/WinnerCardGenerator")),
};

const AdminDashboard: React.FC = () => {
  const { pathname } = useLocation();

  // Get user permissions from auth store
  const { permissions, loading } = useAuthStore();

  // Debug logging
  console.log("AdminDashboard render:", { pathname, permissions, loading });

  // Helper to check permission
  const hasEnhancedCardPermission = permissions?.includes(
    "CAN_USE_ENHANCED_CARD"
  );

  console.log("Enhanced card permission:", hasEnhancedCardPermission);

  // Type-safe route-component mapping with permission checks
  const routeMap: RouteMap = useMemo(
    () => ({
      "/admin/dashboard": DashboardStats,
      "/admin/users": AdminComponents.UsersTable,
      "/admin/game-types": AdminComponents.GameTypesTable,
      "/admin/cafe-owner-dashboard": AdminComponents.CafeOwnerDashboard,
      "/admin/cafe-owner-management": AdminComponents.CafeOwnerManagement,
      "/admin/certificates": AdminComponents.CertificatesTable,
      "/admin/reward-winner": AdminComponents.RewardWinner,
      "/admin/winner-list": AdminComponents.WinnerList,
      "/admin/winner-scanner": AdminComponents.WinnerScanner,
      "/admin/enhanced-card-generator": () =>
        loading ? (
          <div className="flex items-center justify-center h-80">
            <LoadingSpinner />
          </div>
        ) : hasEnhancedCardPermission ? (
          <AdminComponents.EnhancedCardGenerator />
        ) : (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Access Denied
            </h2>
            <p className="text-lg text-gray-400">
              You do not have permission to use this page. Please contact the
              superadmin.
            </p>
          </div>
        ),
      "/admin/enhanced-qr-scanner": () =>
        loading ? (
          <div className="flex items-center justify-center h-80">
            <LoadingSpinner />
          </div>
        ) : hasEnhancedCardPermission ? (
          <AdminComponents.EnhancedQRScanner />
        ) : (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Access Denied
            </h2>
            <p className="text-lg text-gray-400">
              You do not have permission to use this page. Please contact the
              superadmin.
            </p>
          </div>
        ),
      "/admin/winner-card-generator": AdminComponents.WinnerCardGenerator,
      "/admin/database": React.lazy(() => import("../../routes/admin/database/page")),
    }),
    [permissions, loading, hasEnhancedCardPermission]
  );

  // Default content for unknown routes
  const defaultContent = useMemo(
    () => (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to the admin dashboard. Select a section from the navigation.
        </p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Current path: {pathname}</p>
          <p className="text-sm text-gray-600">Available routes: {Object.keys(routeMap).join(', ')}</p>
        </div>
      </div>
    ),
    [pathname, routeMap]
  );

  // Get the matched component or use default
  const CurrentComponent = routeMap[pathname] || (() => defaultContent);

  console.log("AdminDashboard route matching:", { 
    pathname, 
    matchedRoute: routeMap[pathname] ? pathname : 'default',
    CurrentComponent: CurrentComponent.name || 'function'
  });

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-80">
          <LoadingSpinner />
        </div>
      }
    >
      <CurrentComponent />
    </React.Suspense>
  );
};

export default AdminDashboard;
