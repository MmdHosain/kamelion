import React from 'react';
import ChatSuggestions from './ChatSuggestions';
import MessageRenderer from '../MessageRenderer';

const ChatMessages = ({ messages, onCtaAction, onOpenSignup }) => {
  const handleCtaAction = (message) => {
    if (message.type === 'cta' && message.payload?.action === 'open_signup') {
      onOpenSignup();
    }
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#6B6E6C] text-sm">
        <div className="bg-[#2F5D50]/10 p-4 rounded-2xl mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V8"/>
            <path d="M10 14 8 12"/>
            <path d="M14 10 16 8"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <p>با دستیار پزشکی خود گفتگو کنید</p>
        <p className="text-xs mt-1 opacity-70">سوالات تخصصی خود را درباره جراحی پستان بپرسید</p>
        <ChatSuggestions onSendMessage={(text) => {
          // This would be handled by parent
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, i) => (
        <MessageRenderer
          key={i}
          message={msg}
          onCtaAction={handleCtaAction}
        />
      ))}
    </div>
  );
};

export default ChatMessages;