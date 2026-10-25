import React from 'react';
import { AlertCircle } from 'lucide-react';
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
  onOpenAppointment,
  isTyping = false,
}) => {
  const handleSuggestionClick = (text) => {
    handleSendMessage(text);
  };

  // هندل کردن CTA برای نوبت‌دهی
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
            <div className="bg-white border border-amber-200 shadow-sm rounded-2xl p-3 sm:p-3.5 shrink-0 flex items-start gap-2.5 text-right">
              <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-black text-slate-800 mb-0.5">
                  راهنمای مراجعین و سلب مسئولیت پزشکی
                </span>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium">
                  دستیار هوشمند تریاژ جهت آموزش و ارزیابی اولیه بر اساس پروتکل‌های دکتر نگار معشوری طراحی شده و جایگزین ویزیت یا تشخیص پزشکی نیست.
                </p>
              </div>
            </div>
            <ChatMessages
              messages={messages}
              onCtaAction={handleCtaWithAppointment}
              onOpenSignup={onOpenSignup}
              onSendMessage={handleSuggestionClick}
              isTyping={isTyping}
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
