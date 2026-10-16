// src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

/* Hooks & Stores */
import useAuthStore from './store/authStore';
import LazyLoadBoundary from './components/ui/LazyLoadBoundary';
import { useScrollFade } from './hooks/useScrollFade';
import { useThemeStore, applyThemeToDom } from './store/themeStore';

/* Layout */
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

/* Pages */
import HomePage from './pages/HomePage';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import FloatingChatWidget from './components/chat/FloatingChatWidget';
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const VideoPage = lazy(() => import('./pages/VideoPage'));

const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
/* On-demand forms */
const AppointmentModal = lazy(() => import('./components/ui/AppointmentModal'));
const AuthModal = lazy(() => import('./components/ui/AuthModal'));

const LoadingNotice = ({ overlay = false, onClose }) => (
  <div className={overlay ? 'fixed inset-0 z-[10000] flex items-center justify-center bg-white/95' : 'flex-grow p-24 text-center'}>
    <div dir="rtl">
      <p role="status" aria-live="polite">در حال بارگذاری…</p>
      {onClose && <button type="button" onClick={onClose}>بستن</button>}
    </div>
  </div>
);

const App = () => {
  const authModalOpen = useAuthStore((state) => state.authModalOpen);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const { activeTheme, fetchTheme } = useThemeStore();
  const [openAppointment, setOpenAppointment] = useState(false);
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
          onOpenChat={() => setOpenChat(true)}
        />
      )}

      <LazyLoadBoundary key={location.pathname}>
      <Suspense fallback={<LoadingNotice />} >
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
          path="/services"
          element={<ServicesPage onOpenAppointment={() => setOpenAppointment(true)} />}
        />
        <Route
          path="/faq"
          element={<FaqPage onOpenChat={() => setOpenChat(true)} />}
        />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/videos" element={<VideoPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/*" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </LazyLoadBoundary>

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
          {openAppointment && <LazyLoadBoundary>
          <Suspense fallback={<LoadingNotice overlay onClose={() => setOpenAppointment(false)} />} >
          <AppointmentModal
            open={openAppointment}
            onClose={() => setOpenAppointment(false)}
          />
          </Suspense>
          </LazyLoadBoundary>}

          {/* Auth Modal for Login/OTP if required */}
          {authModalOpen && <LazyLoadBoundary>
            <Suspense fallback={<LoadingNotice overlay onClose={() => useAuthStore.getState().closeAuthModal()} />} >
              <AuthModal />
            </Suspense>
          </LazyLoadBoundary>}
        </>
      )}
    </div>
  );
};

export default App;
