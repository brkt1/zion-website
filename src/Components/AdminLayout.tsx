import { supabase } from "@/supabaseClient";
import React, { useEffect, useState } from "react";
import { NavLink, Navigate, useLocation } from "react-router-dom";
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

        if (fetchedUser) {
          console.log("USER ID:", fetchedUser.id);
        }

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
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/game-types"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Game Types
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/cards"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Card Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                User Administration
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/cafe-owner-dashboard"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Cafe Owner Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/cafe-owner-management"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Cafe Owner Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/certificates"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Certificates
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reward-winner"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Reward Winner
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/role-permission-editor"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Role Permission Editor
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/system-settings"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                System Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/winner-list"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Winner List
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/winner-scanner"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Winner Scanner
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/enhanced-card-generator"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Enhanced Card Generator
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/enhanced-qr-scanner"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Enhanced QR Scanner
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/winner-card-generator"
                className={({ isActive }) =>
                  `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                }
              >
                Winner Card Generator
              </NavLink>
            </li>
            {profile?.role === "SUPER_ADMIN" && (
              <>
                <li>
                  <NavLink
                    to="/admin/permissions"
                    className={({ isActive }) =>
                      `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                    }
                  >
                    Permissions
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/audit-logs"
                    className={({ isActive }) =>
                      `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                    }
                  >
                    Audit Logs
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/permission-manager"
                    className={({ isActive }) =>
                      `block p-2 rounded ${isActive ? 'bg-yellow-500 text-black-primary' : 'hover:bg-black-secondary'}`
                    }
                  >
                    Permission Manager
                  </NavLink>
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
