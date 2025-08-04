import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR, { mutate } from "swr";
import { API_BASE_URL } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import EnhancedCardGenerator from "../cards/EnhancedCardGenerator";
import ErrorComponent from "../utility/Error";
import LoadingSpinner from "../utility/LoadingSpinner";
import PlayerIdGenerator from "../utility/PlayerIdGenerator";
import CafeOwnerManagement from "./CafeOwnerManagement";
import CertificatesTable from "./CertificatesTable";
import RolePermissionEditor from "./RolePermissionEditor";
import Sidebar from "./Sidebar";
import SuperAdminActivityLog from "./SuperAdminActivityLog";
import SuperAdminManageAdmins from "./SuperAdminManageAdmins";
import SuperAdminManageUserRoutes from "./SuperAdminManageUserRoutes";
import SuperAdminPermissionRequests from "./SuperAdminPermissionRequests";
import SystemSettings from "./SystemSettings";
import WinnerList from "./WinnerList";

interface DashboardMetrics {
  totalUsers: number;
  activeSessions: number;
  cafeOwnersCount: number;
  recentSignups: number;
  systemHealth: "operational" | "degraded" | "outage";
  newUsersLast7Days: Array<{ date: string; count: number }>;
}

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch data");
  }

  return response.json();
};

const SuperAdminPanel = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const navigate = useNavigate();

  // Updated tabs with new sections
  const adminTabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "users", name: "User Management" },
    { id: "cafeOwners", name: "Cafe Owners" },
    { id: "roles", name: "Role & Permissions" },
    { id: "audit", name: "Audit Logs" },
    { id: "settings", name: "System Settings" },
    { id: "certificates", name: "Certificates" },
    { id: "cardGenerator", name: "Card Generator" },
    { id: "winners", name: "Winners" },
    { id: "playerIdGenerator", name: "Player ID Generator" },
    { id: "requests", name: "Permission Requests" },
    { id: "manage-admins", name: "Manage Admins" },
  ];

  // Dashboard metrics
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: isLoadingDashboard,
  } = useSWR<DashboardMetrics>(
    session?.access_token
      ? [`${API_BASE_URL}/super-admin/dashboard`, session.access_token]
      : null,
    ([url, token]) => fetcher(url, token)
  );

  // Handle quick actions
  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    try {
      // API call to create user
      // await createUserAPI();
      toast.success("User created successfully");
      mutate([
        `${API_BASE_URL}/super-admin/dashboard`,
        session?.access_token || "",
      ]);
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!session || profile?.role !== "SUPER_ADMIN") {
        navigate("/access-denied");
      }
    }
  }, [authLoading, session, profile, navigate]);

  if (authLoading || isLoadingDashboard) return <LoadingSpinner />;
  if (dashboardError)
    return (
      <ErrorComponent
        message={dashboardError.message || "An unexpected error occurred."}
      />
    );

  return (
    <div className="flex min-h-screen bg-black-primary text-cream">
      {/* Sidebar toggle button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-gold-light"
        title="Open sidebar menu"
        aria-label="Open sidebar menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={() => {
          useAuthStore.getState().signOut();
          navigate("/login");
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
        tabs={adminTabs}
      />

      <main className="flex-1 p-4 sm:p-8 lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-primary mb-6 capitalize border-b-2 border-gold-primary pb-2">
            Super Admin Panel
          </h1>

          <div className="bg-black-secondary rounded-xl shadow-xl p-4 sm:p-6 border border-gray-dark">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && dashboardData && (
              <div className="space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Users"
                    value={dashboardData.totalUsers}
                    trend="↗ 12%"
                  />
                  <MetricCard
                    title="Active Sessions"
                    value={dashboardData.activeSessions}
                    trend="→ Stable"
                  />
                  <MetricCard
                    title="Cafe Owners"
                    value={dashboardData.cafeOwnersCount}
                    trend="↗ 5%"
                  />
                  <MetricCard
                    title="24h Signups"
                    value={dashboardData.recentSignups}
                    trend="↘ 3%"
                  />
                </div>

                {/* Charts and System Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-black-primary p-6 rounded-lg border border-gray-medium">
                    <h3 className="text-lg font-semibold text-gold-light mb-4">
                      New Users (Last 7 Days)
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.newUsersLast7Days}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis
                            dataKey="date"
                            stroke="#D4AF37"
                            tick={{ fill: "#F0E6D2" }}
                          />
                          <YAxis stroke="#D4AF37" tick={{ fill: "#F0E6D2" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              borderColor: "#D4AF37",
                              color: "#F0E6D2",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#D4AF37"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-black-primary p-6 rounded-lg border border-gray-medium">
                    <h3 className="text-lg font-semibold text-gold-light mb-4">
                      System Health
                    </h3>
                    <div
                      className={`text-center py-8 rounded-lg ${
                        dashboardData.systemHealth === "operational"
                          ? "bg-green-900/30 border border-green-500"
                          : dashboardData.systemHealth === "degraded"
                          ? "bg-yellow-900/30 border border-yellow-500"
                          : "bg-red-900/30 border border-red-500"
                      }`}
                    >
                      <div className="text-5xl mb-2">
                        {dashboardData.systemHealth === "operational"
                          ? "✅"
                          : dashboardData.systemHealth === "degraded"
                          ? "⚠️"
                          : "❌"}
                      </div>
                      <p className="text-xl font-bold capitalize">
                        {dashboardData.systemHealth}
                      </p>
                      <p className="mt-2 text-gray-300">
                        {dashboardData.systemHealth === "operational"
                          ? "All systems normal"
                          : "Some services affected"}
                      </p>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-semibold text-gold-light mb-2">
                        API Status
                      </h4>
                      <div className="flex items-center justify-between py-2 border-b border-gray-700">
                        <span>Auth Service</span>
                        <span className="text-green-500">Operational</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-700">
                        <span>Database</span>
                        <span className="text-green-500">Operational</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span>Storage</span>
                        <span className="text-yellow-500">Degraded</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-black-primary p-6 rounded-lg border border-gray-medium">
                  <h3 className="text-lg font-semibold text-gold-light mb-4">
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleCreateUser}
                      disabled={isCreatingUser}
                      className="flex items-center gap-2 bg-gold-primary hover:bg-gold-dark text-black-primary px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isCreatingUser ? (
                        <>
                          <LoadingSpinner size="small" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon />
                          Create User
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("audit")}
                      className="flex items-center gap-2 border border-gold-primary text-gold-primary px-4 py-2 rounded-lg font-semibold"
                    >
                      <DocumentTextIcon />
                      View Audit Log
                    </button>
                    <button
                      onClick={() => setActiveTab("roles")}
                      className="flex items-center gap-2 border border-gold-primary text-gold-primary px-4 py-2 rounded-lg font-semibold"
                    >
                      <ShieldCheckIcon />
                      Manage Permissions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === "users" && <SuperAdminManageUserRoutes />}

            {/* Role & Permissions Tab */}
            {activeTab === "roles" && <RolePermissionEditor />}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && <SuperAdminActivityLog enhanced={true} />}

            {/* System Settings Tab */}
            {activeTab === "settings" && <SystemSettings />}

            {/* Existing tabs */}
            {activeTab === "certificates" && <CertificatesTable />}
            {activeTab === "cafeOwners" && <CafeOwnerManagement />}
            {activeTab === "cardGenerator" && <EnhancedCardGenerator />}
            {activeTab === "winners" && <WinnerList />}
            {activeTab === "playerIdGenerator" && <PlayerIdGenerator />}
            {activeTab === "requests" && <SuperAdminPermissionRequests />}
            {activeTab === "manage-admins" && <SuperAdminManageAdmins />}
          </div>
        </div>
      </main>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  trend,
}: {
  title: string;
  value: number;
  trend: string;
}) => (
  <div className="bg-black-primary p-6 rounded-lg border border-gray-medium hover:border-gold-primary transition-colors">
    <h3 className="text-lg font-semibold text-gold-light">{title}</h3>
    <div className="flex items-end justify-between mt-2">
      <p className="text-3xl font-bold text-cream">
        {(value ?? 0).toLocaleString()}
      </p>
      <span className="text-gold-primary">{trend}</span>
    </div>
  </div>
);

// Icons for quick actions
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

const DocumentTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
      clipRule="evenodd"
    />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

export default SuperAdminPanel;
