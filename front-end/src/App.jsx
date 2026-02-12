// src/App.jsx
import React, { useState } from 'react';
import { useChat } from './hooks/useChat';
import { useScrollState } from './hooks/useScrollState';
import { usePageRouter } from './hooks/usePageRouter';
import Header from './components/layout/Header'; // Should now work correctly
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage'; // HomePage should render HeroSection internally
import VideoPage from './pages/VideoPage';
import CommentsPage from './pages/CommentsPage';
import ChatContainer from './components/chat/ChatContainer';
import ResumeButton from './components/chat/ResumeButton';
import FixedChatInput from './components/ui/FixedChatInput';
import AppointmentModal from './components/ui/AppointmentModal'; // Ensure path is correct
import SignupModal from './components/ui/SignupModal'; // Ensure path is correct

const App = () => {
  const {
    messages,
    inputValue,
    setInputValue,
    heroInput,
    setHeroInput,
    chatState,
    setChatState,
    handleSendMessage,
    handleHeroSubmit, // This function expects an object
    handleCtaAction
  } = useChat();
  // NEW FUNCTION: Handles the submission from the fixed input box
const handleFixedInputSubmit = (textValue) => {
  if (!textValue.trim()) return;
  handleSendMessage(textValue);
  setChatState('maximized');
  setHeroInput(''); // Clear heroInput if used for initial submit
};

  const { scrolled } = useScrollState();
  const { page, setPage } = usePageRouter();

  const [open, setOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleOpenSignup = () => {
    setSignupOpen(true);
  };

  const handleCtaActionWrapper = (payload) => {
    handleCtaAction(payload, handleOpenSignup);
  };

  const handleMinimizeChat = () => {
    setChatState('minimized');
  };

  const handleMaximizeChat = () => {
    setChatState('maximized');
  };

  const shouldShowFixedInput = chatState === 'minimized' && messages.length === 0;
  const shouldShowResumeButton = chatState === 'minimized' && messages.length > 0;

  const renderCurrentPage = () => {
    switch (page) {
      case 'video':
        return <VideoPage onBack={() => setPage("home")} />;
      case 'comments':
        return <CommentsPage onBack={() => setPage("home")} />;
      default:
        return <HomePage />; // HomePage now renders HeroSection, ServicesSection, AboutSection
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF8] text-[#6B6E6C] dir-rtl">
      <Header
        scrolled={scrolled}
        onNavigate={setPage}
        onOpenAppointment={() => setOpen(true)}
      />

      {renderCurrentPage()}

      <Footer />

      <FixedChatInput
        isVisible={shouldShowFixedInput}
        value={heroInput}
        onChange={setHeroInput}
        onSubmit={handleHeroSubmit} // Pass the function expecting the object
        onSubmitInput={handleFixedInputSubmit}
      />

      {shouldShowResumeButton && (
        <ResumeButton onClick={handleMaximizeChat} />
      )}
<ChatContainer
  chatState={chatState}
  messages={messages}
  inputValue={inputValue}
  setInputValue={setInputValue}
  handleSendMessage={handleSendMessage}
  handleCtaAction={handleCtaActionWrapper}
  onOpenSignup={handleOpenSignup}
  onMinimize={handleMinimizeChat}
  handleFixedInputSubmit={handleFixedInputSubmit} // Pass the function
/>

      <AppointmentModal
        open={open}
        onClose={() => setOpen(false)}
      />

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSubmit={(data) => {
          console.log('Signup Data:', data);
          setSignupOpen(false);
        }}
      />
    </div>
  );
};

export default App;