import { supabase } from "@/supabaseClient";
import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "./utility/LoadingSpinner";

export default function AdminLayout({
  // Removed async
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clientSupabase = supabase; // Use the imported supabase client

        const {
          data: { user: fetchedUser },
          error: userError,
        } = await clientSupabase.auth.getUser();
        if (userError) throw userError;
        setUser(fetchedUser);

        if (!fetchedUser) {
          setLoading(false);
          return;
        }

        // Fetch profile
        const { data: fetchedProfile, error: profileError } =
          await clientSupabase
            .from("profiles")
            .select("*")
            .eq("id", fetchedUser.id)
            .single();
        if (profileError) throw profileError;
        setProfile(fetchedProfile);

        // Fetch permissions
        const { data: permissionsData, error: permissionsError } =
          await clientSupabase
            .from("profile_permissions")
            .select("permission_name")
            .eq("profile_id", fetchedUser.id);
        if (permissionsError) throw permissionsError;
        setPermissions(
          permissionsData?.map((p: any) => p.permission_name) || []
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return <LoadingSpinner />; // Show loading spinner while fetching data
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>; // Show error message
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Permission check for enhanced card routes
  const enhancedCardRoutes = [
    "/admin/enhanced-card-generator",
    "/admin/enhanced-qr-scanner",
  ];
  const isEnhancedCardRoute = enhancedCardRoutes.includes(location.pathname);
  const hasEnhancedCardPermission = permissions.includes(
    "CAN_USE_ENHANCED_CARD"
  );

  if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (isEnhancedCardRoute && !hasEnhancedCardPermission) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-lg text-gray-400">
          You do not have permission to use this page. Please contact the
          superadmin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black-primary text-cream">
      {/* Sidebar */}
      <div className="w-64 bg-black-secondary text-cream p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Portal</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/game-types"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Game Types
              </Link>
            </li>
            <li>
              <Link
                to="/admin/cards"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Card Management
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                User Administration
              </Link>
            </li>
            <li>
              <Link
                to="/admin/cafe-owner-dashboard"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Cafe Owner Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/cafe-owner-management"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Cafe Owner Management
              </Link>
            </li>
            <li>
              <Link
                to="/admin/certificates"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Certificates
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reward-winner"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Reward Winner
              </Link>
            </li>
            <li>
              <Link
                to="/admin/role-permission-editor"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Role Permission Editor
              </Link>
            </li>
            <li>
              <Link
                to="/admin/system-settings"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                System Settings
              </Link>
            </li>
            <li>
              <Link
                to="/admin/winner-list"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Winner List
              </Link>
            </li>
            <li>
              <Link
                to="/admin/winner-scanner"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Winner Scanner
              </Link>
            </li>
            <li>
              <Link
                to="/admin/enhanced-card-generator"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Enhanced Card Generator
              </Link>
            </li>
            <li>
              <Link
                to="/admin/enhanced-qr-scanner"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Enhanced QR Scanner
              </Link>
            </li>
            <li>
              <Link
                to="/admin/winner-card-generator"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Winner Card Generator
              </Link>
            </li>
            {profile?.role === "SUPER_ADMIN" && (
              <>
                <li>
                  <Link
                    to="/admin/permissions"
                    className="block p-2 rounded hover:bg-black-secondary"
                  >
                    Permissions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/audit-logs"
                    className="block p-2 rounded hover:bg-black-secondary"
                  >
                    Audit Logs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/permission-manager"
                    className="block p-2 rounded hover:bg-black-secondary"
                  >
                    Permission Manager
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="border border-yellow-500 border-opacity-50 border-dashed">
          {children}
        </main>
      </div>
    </div>
  );
}
