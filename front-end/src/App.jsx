// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

/* Hooks */
import { useChat } from './hooks/useChat';
import { useScrollState } from './hooks/useScrollState';
import { useAuth } from './hooks/useAuth';

/* Layout */
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

/* Pages */
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import CommentsPage from './pages/CommentsPage';
import AdminPage from './pages/admin/AdminPage';
import AdminLogin from './pages/admin/AdminLogin'; // ✅ Added

/* Admin Protection */
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'; // ✅ Added

/* Chat */
import ChatContainer from './components/chat/ChatContainer';
import ResumeButton from './components/chat/ResumeButton';
import FixedChatInput from './components/ui/FixedChatInput';

/* Modals */
import AppointmentModal from './components/ui/AppointmentModal';
import SignupModal from './components/ui/SignupModal';
import LoginModal from './components/ui/LoginModal';
import OtpModal from './components/ui/OtpModal';
import AuthModal from './components/ui/AuthModal';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* Detect Admin route */
  const isAdminRoute = location.pathname.startsWith('/admin');

  /* Chat */
  const {
    messages,
    inputValue,
    setInputValue,
    heroInput,
    setHeroInput,
    chatState,
    setChatState,
    handleSendMessage,
    handleHeroSubmit,
    handleCtaAction,
    playScenario,
    isPlayingScenario
  } = useChat();

  /* Auth */
  const {
    user,
    accessToken,
    phoneNumber,
    otpOpen,
    loading,
    error,
    authModalOpen,        
    setAuthModalOpen,     
    handleAuthSubmit,
    handleVerifyOtp,
    setOtpOpen,
    logout
  } = useAuth();

  /* UI State */
  const { scrolled } = useScrollState();
  const [openAppointment, setOpenAppointment] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleFixedInputSubmit = (textValue) => {
    if (!textValue.trim()) return;
    handleSendMessage(textValue);
    setChatState('maximized');
    setHeroInput('');
  };

  const handlePlayScenario = (scenarioMessages) => {
    playScenario(scenarioMessages);
    setChatState('maximized');
  };

  const handleCtaActionWrapper = (payload) => {
    if (payload?.action === 'open_signup') setSignupOpen(true);
    if (payload?.action === 'open_login') setLoginOpen(true);
    if (payload?.action === 'open_appointment') setOpenAppointment(true);

    handleCtaAction(payload, () => setSignupOpen(true));
  };

  const shouldShowFixedInput =
    chatState === 'minimized' && messages.length === 0;

  const shouldShowResumeButton =
    chatState === 'minimized' && messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF8] text-[#6B6E6C] dir-rtl">

      {/* PUBLIC LAYOUT (HIDDEN ON ADMIN ROUTES) */}
      {!isAdminRoute && (
        <Header
          scrolled={scrolled}
          onNavigate={navigate}
          onOpenAppointment={() => setOpenAppointment(true)}
        />
      )}

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/comments" element={<CommentsPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} /> {/* ✅ Added */}

        {/* Protected Admin Routes */}
        <Route element={<AdminProtectedRoute />}> {/* ✅ Added */}
          <Route path="/admin/*" element={<AdminPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PUBLIC LAYOUT FOOTER */}
      {!isAdminRoute && <Footer />}

      {/* PUBLIC CHAT UI */}
      {!isAdminRoute && (
        <>
          <FixedChatInput
            isVisible={shouldShowFixedInput}
            value={heroInput}
            onChange={setHeroInput}
            onSubmit={handleHeroSubmit}
            onSubmitInput={handleFixedInputSubmit}
            onPlayScenario={handlePlayScenario}
          />

          {shouldShowResumeButton && (
            <ResumeButton onClick={() => setChatState('maximized')} />
          )}

          <ChatContainer
            chatState={chatState}
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            handleCtaAction={handleCtaActionWrapper}
            onOpenSignup={() => setSignupOpen(true)}
            onMinimize={() => setChatState('minimized')}
            handleFixedInputSubmit={handleFixedInputSubmit}
          />

          <AppointmentModal
            open={openAppointment}
            onClose={() => setOpenAppointment(false)}
          />

          <LoginModal
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            onAuthSubmit={handleAuthSubmit}
          />

          <SignupModal
            open={signupOpen}
            onClose={() => setSignupOpen(false)}
            onAuthSubmit={handleAuthSubmit}
          />

          <OtpModal
            open={otpOpen}
            phoneNumber={phoneNumber}
            onVerify={handleVerifyOtp}
            onClose={() => setOtpOpen(false)}
            loading={loading}
            error={error}
          />

          <AuthModal 
            open={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
          />
        </>
      )}

    </div>
  );
};

export default App;
