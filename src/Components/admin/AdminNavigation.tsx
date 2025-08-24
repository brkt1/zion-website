import {
  DocumentTextIcon,
  QrCodeIcon,
  TrophyIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  TableCellsIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNavigation: React.FC = () => {
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: Cog6ToothIcon,
      description: 'Admin overview and statistics'
    },
    {
      name: 'Database Management',
      href: '/admin/database',
      icon: CircleStackIcon,
      description: 'Full database control and management'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      description: 'Manage user accounts and permissions'
    },
    {
      name: 'Game Types',
      href: '/admin/game-types',
      icon: TableCellsIcon,
      description: 'Configure game types and settings'
    },
    {
      name: 'Certificates',
      href: '/admin/certificates',
      icon: DocumentTextIcon,
      description: 'Generate and manage certificates'
    },
    {
      name: 'Winner Management',
      href: '/admin/winner-list',
      icon: TrophyIcon,
      description: 'Manage winners and rewards'
    },
    {
      name: 'Card Generator',
      href: '/admin/enhanced-card-generator',
      icon: QrCodeIcon,
      description: 'Generate enhanced game cards'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group relative rounded-lg p-4 border-2 transition-all duration-200 hover:shadow-md ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500 group-hover:text-gray-700">
                  {item.description}
                </p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminNavigation;
