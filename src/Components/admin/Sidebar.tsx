import React from "react";
import { useNavigate } from "react-router-dom";

interface Profile {
  email: string;
  role: string;
  name?: string;
  avatar?: string;
}

type Tab = {
  id: string;
  name: string;
  icon?: React.ReactNode;
};

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  handleLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  profile?: Profile;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  handleLogout,
  isOpen,
  onClose,
  tabs,
  profile,
}) => {
  const navigate = useNavigate();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
    if (tabId === "superAdmin") {
      navigate("/super-admin");
    }
  };

  // Default icons for common tabs
  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "dashboard":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        );
      case "users":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "cafeOwners":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            />
          </svg>
        );
      case "roles":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      case "audit":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "settings":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-black-primary shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-amber-500/20 flex justify-between items-center bg-black-primary">
        <div>
          <h2 className="text-2xl font-bold text-amber-400">Admin Panel</h2>
          {profile && (
            <p className="text-xs text-bg-black-primary mt-1">
              {profile.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-amber-400 hover:text-amber-300 transition-colors"
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="p-4 border-b border-amber-500/10 bg-black-primary flex items-center gap-3">
          <div className="flex-shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || profile.email}
                className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold border border-amber-500/30">
                {(profile.name?.[0] ?? profile.email?.[0] ?? "").toUpperCase()}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-bg-black-primary truncate">
              {profile.name || profile.email}
            </p>
            <p className="text-xs text-bg-black-primary truncate">
              {profile.email}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-1 h-[calc(100vh-180px)] overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-amber-500/20 text-amber-400 shadow-md"
                : "text-bg-black-primary hover:bg-black-primary hover:text-bg-black-primary"
            }`}
          >
            {tab.icon || getTabIcon(tab.id)}
            <span>{tab.name}</span>
            {activeTab === tab.id && (
              <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-amber-500/20 bg-black-primary">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
