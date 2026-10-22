import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';

/* Hooks & Stores */
import { useScrollFade } from './hooks/useScrollFade';
import { usePageReady } from './hooks/usePageReady';
import { useThemeStore, applyThemeToDom } from './store/themeStore';

/* Layout & Loading Fallbacks */
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import RouteLoadingFallback from './components/ui/RouteLoadingFallback';
import InitialPageLoader from './components/ui/InitialPageLoader';

/* Pages: Eager loaded for instant first paint */
import HomePage from './pages/HomePage';

/* Pages: Lazy loaded chunks to optimize weak 3G/4G connections */
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TherapeuticServicesPage = lazy(() => import('./pages/TherapeuticServicesPage'));
const AestheticServicesPage = lazy(() => import('./pages/AestheticServicesPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const VideoPage = lazy(() => import('./pages/VideoPage'));

/* Admin Pages: Heaviest chunks completely isolated from public visitors */
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

/* Chat & Modals */
import FloatingChatWidget from './components/chat/FloatingChatWidget';
import AppointmentModal from './components/ui/AppointmentModal';
import MyAppointmentsModal from './components/ui/MyAppointmentsModal';
import AuthModal from './components/ui/AuthModal';

const ArticleRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/resources/${slug}`} replace />;
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const { activeTheme, fetchTheme } = useThemeStore();
  const isPageReady = usePageReady();
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
      {/* Initial Page Readiness Preloader */}
      <InitialPageLoader isReady={isPageReady} />

      {/* Top Scroll Progress Bar */}
      <div id="progress"></div>

      {!isAdminRoute && (
        <Header
          onOpenAppointment={() => setOpenAppointment(true)}
          onOpenMyAppointments={() => setOpenMyAppointments(true)}
          onOpenChat={() => setOpenChat(true)}
        />
      )}

      <Suspense fallback={<RouteLoadingFallback />}>
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
          <Route path="/articles/:slug" element={<ArticleRedirect />} />
          <Route path="/video" element={<Navigate to="/videos" replace />} />
          <Route path="/videos" element={<VideoPage />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && (
        <>
          {/* Floating AI Triage FAB in Bottom-Center */}
          <FloatingChatWidget
            isOpen={openChat}
            onToggle={(val) => setOpenChat(typeof val === 'boolean' ? val : !openChat)}
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
