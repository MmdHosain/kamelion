import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

import AdminDashboard from './AdminDashboard';
import ChatProfiles from './ChatProfiles';
import ReservedTimes from './ReservedTimes';

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="chat-profiles" element={<ChatProfiles />} />
        <Route path="reserved-times" element={<ReservedTimes />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
