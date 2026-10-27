import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

import AdminDashboard from './AdminDashboard';
import AppointmentsAvailability from './AppointmentsAvailability'; 
import DoctorAgendaPage from './DoctorAgendaPage';
import PatientsList from '../../components/admin/patients/PatientsList';
import AdminSettings from './AdminSettings';
import AdminComments from './AdminComments';
import AdminVideos from './AdminVideos';
import AdminArticles from './AdminArticles';
import AdminArticleEditor from './AdminArticleEditor';
import AdminContentCms from './AdminContentCms';
import ReservedTimes from './ReservedTimes';
import ChatProfiles from './ChatProfiles';
import AdminAiPlayground from './AdminAiPlayground';

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="appointments" replace />} />
        <Route path="appointments" element={<AppointmentsAvailability />} /> 
        <Route path="agenda" element={<Navigate to="/admin/appointments?tab=Agenda" replace />} />
        <Route path="content" element={<AdminContentCms />} />
        <Route path="articles" element={<Navigate to="/admin/content?tab=articles" replace />} />
        <Route path="articles/new" element={<AdminArticleEditor />} />
        <Route path="articles/:id/edit" element={<AdminArticleEditor />} />
        <Route path="videos" element={<Navigate to="/admin/content?tab=videos" replace />} />
        <Route path="patients" element={<PatientsList />} />
        <Route path="ai-test" element={<AdminAiPlayground />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="stats" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="chat-profiles" element={<ChatProfiles />} />
        <Route path="reserved-times" element={<ReservedTimes />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPage;
