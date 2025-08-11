import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR, { mutate } from "swr";
import { API_BASE_URL } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

interface Profile {
  email?: string;
  role: string;
  name: string;
  avatar?: string;
}

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
  userDistribution: { role: string; count: number }[];
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const SuperAdminPanel = () => {
  // Fetch user permissions (array response)
  const {
    data: permissions,
    error: permissionsError,
    isLoading: isLoadingPermissions,
  } = session?.access_token
    ? useSWR<string[], Error, [string, string]>(
        [`${API_BASE_URL}/profile/permissions`, session.access_token],
        async ([url, token]) => {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) return [];
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
      )
    : { data: [], error: undefined, isLoading: false };
  const { session, profile, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const navigate = useNavigate();

  const adminTabs = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "users", name: "Users", icon: "👥" },
    { id: "cafeOwners", name: "Cafe Owners", icon: "🏪" },
    { id: "roles", name: "Roles", icon: "🔑" },
    { id: "audit", name: "Audit Logs", icon: "📝" },
    { id: "settings", name: "Settings", icon: "⚙️" },
    { id: "certificates", name: "Certificates", icon: "🏆" },
    { id: "cardGenerator", name: "Card Generator", icon: "🎴" },
    { id: "winners", name: "Winners", icon: "🏅" },
    { id: "playerIdGenerator", name: "Player IDs", icon: "🆔" },
    { id: "requests", name: "Requests", icon: "📨" },
    { id: "manage-admins", name: "Admins", icon: "👑" },
  ];

  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: isLoadingDashboard,
  } = session?.access_token
    ? useSWR<DashboardMetrics, Error, [string, string]>(
        [`${API_BASE_URL}/super-admin/dashboard`, session.access_token],
        ([url, token]: [string, string]) => fetcher(url, token)
      )
    : { data: undefined, error: undefined, isLoading: false };

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    try {
      // API call simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    <div className="flex  bg-black-primary text-gray-800 dark:text-gray-200">
      {/* Permissions Display */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 z-50">
        <h3 className="font-bold text-lg mb-2">User Permissions</h3>
        {isLoadingPermissions ? (
          <LoadingSpinner />
        ) : permissionsError ? (
          <ErrorComponent message="Failed to load permissions." />
        ) : permissions.length === 0 ? (
          <p className="text-sm text-gray-500">No permissions assigned.</p>
        ) : (
          <ul className="list-disc pl-5">
            {permissions.map((perm) => (
              <li
                key={perm}
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                {perm}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modern Sidebar */}
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

      <main className="lg:ml-64 max-w-screen-2xl">
        <div className="max-w-full mx-auto">
          {/* Top Bar with Breadcrumbs */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Admin Dashboard
              </h1>
              <nav className="flex text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>Super Admin</span>
                <span className="mx-2">/</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                  {adminTabs.find((tab) => tab.id === activeTab)?.name}
                </span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                    {profile?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && dashboardData && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <MetricCard
                    title="Total Users"
                    value={dashboardData.totalUsers}
                    change="+12%"
                    icon="👥"
                    color="bg-blue-100 dark:bg-blue-900/30"
                  />
                  <MetricCard
                    title="Active Sessions"
                    value={dashboardData.activeSessions}
                    change="+3.2%"
                    icon="👤"
                    color="bg-green-100 dark:bg-green-900/30"
                  />
                  <MetricCard
                    title="Cafe Owners"
                    value={dashboardData.cafeOwnersCount}
                    change="+5.1%"
                    icon="🏪"
                    color="bg-amber-100 dark:bg-amber-900/30"
                  />
                  <MetricCard
                    title="New Signups"
                    value={dashboardData.recentSignups}
                    change="+8.7%"
                    icon="📈"
                    color="bg-purple-100 dark:bg-purple-900/30"
                  />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth Chart */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                        User Growth
                      </h3>
                      <div className="text-sm text-gray-500">Last 7 days</div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.newUsersLast7Days ?? []}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            strokeOpacity={0.2}
                          />
                          <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            tick={{ fill: "#9ca3af" }}
                          />
                          <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              borderColor: "#e5e7eb",
                              borderRadius: "0.5rem",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* User Distribution */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-5">
                      User Distribution
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.userDistribution ?? []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {(dashboardData.userDistribution ?? []).map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              borderColor: "#e5e7eb",
                              borderRadius: "0.5rem",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* System Health & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* System Health */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">
                      System Status
                    </h3>
                    <div className="space-y-4">
                      <StatusIndicator
                        title="API Service"
                        status="operational"
                        lastChecked="2 min ago"
                      />
                      <StatusIndicator
                        title="Database"
                        status="operational"
                        lastChecked="Just now"
                      />
                      <StatusIndicator
                        title="Authentication"
                        status="degraded"
                        lastChecked="5 min ago"
                      />
                      <StatusIndicator
                        title="Storage"
                        status="operational"
                        lastChecked="10 min ago"
                      />
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            System Health
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Current status
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            dashboardData.systemHealth === "operational"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : dashboardData.systemHealth === "degraded"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {dashboardData.systemHealth.charAt(0).toUpperCase() +
                            dashboardData.systemHealth.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800/50">
                    <h3 className="font-bold text-lg text-indigo-800 dark:text-indigo-300 mb-4">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <ActionCard
                        title="Create User"
                        icon="👤"
                        action={handleCreateUser}
                        disabled={isCreatingUser}
                        loading={isCreatingUser}
                      />
                      <ActionCard
                        title="View Audit Log"
                        icon="📝"
                        action={() => setActiveTab("audit")}
                      />
                      <ActionCard
                        title="Manage Permissions"
                        icon="🔑"
                        action={() => setActiveTab("roles")}
                      />
                      <ActionCard
                        title="System Settings"
                        icon="⚙️"
                        action={() => setActiveTab("settings")}
                      />
                      <ActionCard
                        title="Generate Cards"
                        icon="🎴"
                        action={() => setActiveTab("cardGenerator")}
                      />
                      <ActionCard
                        title="View Requests"
                        icon="📨"
                        action={() => setActiveTab("requests")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {activeTab === "users" && <SuperAdminManageUserRoutes />}
            {activeTab === "roles" && <RolePermissionEditor />}
            {activeTab === "audit" && <SuperAdminActivityLog enhanced={true} />}
            {activeTab === "settings" && <SystemSettings />}
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

// Modern Metric Card Component
const MetricCard = ({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string;
  value: number;
  change: string;
  icon: string;
  color: string;
}) => (
  <div
    className={`${color} p-5 rounded-xl shadow-sm transition-all hover:shadow-md`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {title}
        </h3>
        <p className="text-2xl font-bold mt-1">
          {(value ?? 0).toLocaleString()}
        </p>
      </div>
      <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
        <span className="text-xl">{icon}</span>
      </div>
    </div>
    <div className="mt-4">
      <span className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
        {change}
      </span>
      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
        from yesterday
      </span>
    </div>
  </div>
);

// Status Indicator Component
const StatusIndicator = ({
  title,
  status,
  lastChecked,
}: {
  title: string;
  status: "operational" | "degraded" | "outage";
  lastChecked: string;
}) => (
  <div className="flex items-center">
    <div
      className={`w-3 h-3 rounded-full mr-3 ${
        status === "operational"
          ? "bg-green-500"
          : status === "degraded"
          ? "bg-yellow-500"
          : "bg-red-500"
      }`}
    ></div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Last checked: {lastChecked}
      </p>
    </div>
    <div
      className={`text-xs px-2 py-1 rounded ${
        status === "operational"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : status === "degraded"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  </div>
);

// Action Card Component
const ActionCard = ({
  title,
  icon,
  action,
  disabled,
  loading,
}: {
  title: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    onClick={action}
    disabled={disabled}
    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all flex flex-col items-center justify-center text-center h-full hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mb-3">
      <span className="text-xl">{icon}</span>
    </div>
    <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>
    {loading && (
      <div className="mt-2">
        <svg
          className="animate-spin h-5 w-5 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    )}
  </button>
);

export default SuperAdminPanel;
