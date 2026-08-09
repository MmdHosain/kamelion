import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-lightText text-mutedText">
      <AdminSidebar onMenuClick={() => setSidebarOpen(!sidebarOpen)} open={sidebarOpen} onToggle={setSidebarOpen} />

      <div className="flex-1 flex flex-col">


        <main className="p-6 bg-lightText min-h-[calc(100vh-64px)]">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
