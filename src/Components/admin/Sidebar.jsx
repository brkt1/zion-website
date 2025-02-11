// Sidebar.js
import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-8">Admin Panel</h2>
      <nav className="space-y-2">
        <button 
          className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'certificates' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} 
          onClick={() => setActiveTab('certificates')}
        >
          Certificates
        </button>
        <button 
          className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'cafeOwners' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} 
          onClick={() => setActiveTab('cafeOwners')}
        >
          Cafe Owners
        </button>
        <button 
          className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'cardGenerator' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} 
          onClick={() => setActiveTab('cardGenerator')}
        >
          Card Generator
        </button>
        <button 
          className={`w-full text-left px-4 py-2 rounded-lg ${activeTab === 'winners' ? 'bg-gray-100' : 'hover:bg-gray-100'}`} 
          onClick={() => setActiveTab('winners')}
        >
          Winners
        </button>
        <button 
          className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;