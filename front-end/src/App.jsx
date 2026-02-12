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
    if (!textValue.trim()) return; // Check if input is not empty

    // Clear previous conversation if any (though shouldn't be any if this button is visible)
    // setMessages([]); // Not strictly necessary here as it should only show if messages are empty

    // Send the first message
    handleSendMessage(textValue); // Use existing handleSendMessage which manages the conversation state

    // CRITICAL: Maximize the chat window after sending the first message
    setChatState('maximized');

    // Optionally clear the heroInput field after submission if it was used
    // In this case, the FixedChatInput uses 'value' and 'onChange', so if the value was heroInput,
    // it would be cleared by updating heroInput state. However, since FixedChatInput calls this function,
    // it might not have direct access to setHeroInput. We can clear it here if needed.
    // But typically, the heroInput is cleared *after* the submission happens inside the hook.
    // Let's see... FixedChatInput passes its *own* value, not necessarily heroInput.
    // So, if the FixedChatInput's internal state is managed by heroInput in App.jsx, then clearing heroInput here makes sense.
    // However, FixedChatInput receives 'value' and 'onChange' props. If 'value' is heroInput and 'onChange' updates heroInput,
    // then the state should be managed correctly by the parent (App.jsx) via props.
    // The handleSendMessage function clears inputValue, not heroInput.
    // Let's clear the corresponding input state if needed. Since the FixedChatInput uses heroInput's value,
    // we should clear heroInput after submission.
    setHeroInput(''); // Clear the heroInput after submitting the first message via the fixed input
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