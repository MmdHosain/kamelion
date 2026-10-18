// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

/* Hooks & Stores */
import { useScrollFade } from './hooks/useScrollFade';
import { useThemeStore, applyThemeToDom } from './store/themeStore';

/* Layout */
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

/* Pages */
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TherapeuticServicesPage from './pages/TherapeuticServicesPage';
import AestheticServicesPage from './pages/AestheticServicesPage';
import FaqPage from './pages/FaqPage';
import ResourcesPage from './pages/ResourcesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import VideoPage from './pages/VideoPage';

import AdminPage from './pages/admin/AdminPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

/* Chat & Modals */
import FloatingChatWidget from './components/chat/FloatingChatWidget';
import AppointmentModal from './components/ui/AppointmentModal';
import MyAppointmentsModal from './components/ui/MyAppointmentsModal';
import AuthModal from './components/ui/AuthModal';

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const { activeTheme, fetchTheme } = useThemeStore();
  const [openAppointment, setOpenAppointment] = useState(false);
  const [openMyAppointments, setOpenMyAppointments] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  // Sync theme with server on mount and apply to DOM
  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  useEffect(() => {
    applyThemeToDom(activeTheme);
  }, [activeTheme]);

  useScrollFade();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* Top Scroll Progress Bar */}
      <div id="progress"></div>

      {!isAdminRoute && (
        <Header
          onOpenAppointment={() => setOpenAppointment(true)}
          onOpenMyAppointments={() => setOpenMyAppointments(true)}
          onOpenChat={() => setOpenChat(true)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onOpenAppointment={() => setOpenAppointment(true)}
              onOpenChat={() => setOpenChat(true)}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/services/therapeutic"
          element={<TherapeuticServicesPage onOpenAppointment={() => setOpenAppointment(true)} />}
        />
        <Route
          path="/services/aesthetic"
          element={<AestheticServicesPage onOpenAppointment={() => setOpenAppointment(true)} />}
        />
        <Route
          path="/services"
          element={<Navigate to="/services/therapeutic" replace />}
        />
        <Route
          path="/faq"
          element={<FaqPage onOpenChat={() => setOpenChat(true)} />}
        />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route
          path="/resources/:slug"
          element={<ArticleDetailPage onOpenAppointment={() => setOpenAppointment(true)} />}
        />
        <Route
          path="/articles/:slug"
          element={<ArticleDetailPage onOpenAppointment={() => setOpenAppointment(true)} />}
        />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/videos" element={<VideoPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/*" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && (
        <>
          {/* Floating AI Triage FAB in Bottom-Center */}
          <FloatingChatWidget
            isOpen={openChat}
            onToggle={() => setOpenChat(!openChat)}
            onOpenAppointment={() => {
              setOpenChat(false);
              setOpenAppointment(true);
            }}
          />

          {/* Appointment Booking Modal */}
          <AppointmentModal
            open={openAppointment}
            onClose={() => setOpenAppointment(false)}
            onOpenMyAppointments={() => {
              setOpenAppointment(false);
              setOpenMyAppointments(true);
            }}
          />

          {/* My Appointments (User Portal) Modal */}
          <MyAppointmentsModal
            open={openMyAppointments}
            onClose={() => setOpenMyAppointments(false)}
            onOpenNewBooking={() => {
              setOpenMyAppointments(false);
              setOpenAppointment(true);
            }}
          />

          {/* Auth Modal for Login/OTP if required */}
          <AuthModal />
        </>
      )}
    </div>
  );
};

export default App;
