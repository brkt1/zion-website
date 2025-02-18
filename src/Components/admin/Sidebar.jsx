// components/admin/Sidebar.jsx
import React from 'react';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  handleLogout, 
  isOpen, 
  onClose 
}) => (
  <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="p-6 border-b border-amber-500/20 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-amber-400">Admin Panel</h2>
      <button
        onClick={onClose}
        className="lg:hidden text-amber-400 hover:text-amber-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <nav className="p-4 space-y-2 h-[calc(100vh-160px)] overflow-y-auto">
      {['certificates', 'cafeOwners', 'cardGenerator', 'winners'].map((tab) => (
        <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            onClose();
          }}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
            activeTab === tab 
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tab.replace(/([A-Z])/g, ' $1')}
        </button>
      ))}
    </nav>

    <div className="absolute bottom-0 w-full p-4 border-t border-amber-500/20">
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Logout
      </button>
    </div>
  </div>
);

export default Sidebar;