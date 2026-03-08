import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

import AdminDashboard from './AdminDashboard';
import ChatProfiles from './ChatProfiles';
import ReservedTimes from './ReservedTimes';
import AppointmentsAvailability from './AppointmentsAvailability'; // ← ADD THIS

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="chat-profiles" element={<ChatProfiles />} />
        <Route path="reserved-times" element={<ReservedTimes />} />
        <Route path="appointments" element={<AppointmentsAvailability />} /> {/* ← ADD THIS */}
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
