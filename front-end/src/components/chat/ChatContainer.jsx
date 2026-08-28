// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const ChatContainer = ({
  chatState,
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  handleCtaAction,
  onOpenSignup,
  onMinimize,
  onOpenAppointment // ✅ جدید
}) => {
  const handleSuggestionClick = (text) => {
    handleSendMessage(text);
  };

  // ✅ هندل کردن CTA برای نوبت‌دهی
  const handleCtaWithAppointment = (payload) => {
    if (payload.action === 'open_appointment') {
      onOpenAppointment();
    }
    handleCtaAction(payload);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${chatState === 'minimized' ? 'pointer-events-none bg-black/0' : 'bg-black/30 backdrop-blur-sm'}
      `}
    >
      <div className={`fixed bottom-0 left-0 right-0 bg-chatBg-100 border-t border-primary/30 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col
        ${chatState === 'maximized' ? 'h-[85vh] translate-y-0 rounded-t-3xl' : 'translate-y-full'}
      `}>
        <ChatHeader onMinimize={onMinimize} />
        <div className="flex-1 bg-chatBg-200 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
            <ChatMessages
              messages={messages}
              onCtaAction={handleCtaWithAppointment}
              onOpenSignup={onOpenSignup}
              onSendMessage={handleSuggestionClick}
            />
          </div>
          <div className="p-4 bg-chatBg-300 border-t border-primary/30">
            <div className="relative flex items-center gap-2">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
