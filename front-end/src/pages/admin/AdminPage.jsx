import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ← IMPORT Navigate HERE
import AdminLayout from '../../components/admin/AdminLayout';

import AdminDashboard from './AdminDashboard';
import ChatProfiles from './ChatProfiles';
import ReservedTimes from './ReservedTimes';
import AppointmentsAvailability from './AppointmentsAvailability'; 
import PatientsList from '../../components/admin/patients/PatientsList';

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        {/* 1. This makes Appointments the default loaded page */}
        <Route index element={<Navigate to="appointments" replace />} />
        
        {/* 2. Your actual Appointments route */}
        <Route path="appointments" element={<AppointmentsAvailability />} /> 
        
        {/* 3. Give Stats its own specific path so it doesn't disappear! */}
        <Route path="stats" element={<AdminDashboard />} />
        
        {/* Other routes */}
        <Route path="chat-profiles" element={<ChatProfiles />} />
        <Route path="reserved-times" element={<ReservedTimes />} />
        <Route path="patients" element={<PatientsList />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
