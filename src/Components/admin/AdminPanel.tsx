import React from 'react';
import AdminLayout from '../AdminLayout';
import AdminDashboard from './AdminDashboard'; // Import the new AdminDashboard component

const AdminPanel: React.FC = () => {
  return (
    <AdminLayout>
      <AdminDashboard /> {/* Render the AdminDashboard component */}
    </AdminLayout>
  );
};

export default AdminPanel;
