// src/components/chat/FloatingChatWidget.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Calendar,
  HelpCircle,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import useFooterOverlap from '../../hooks/useFooterOverlap';
import useChatSession from '../../hooks/useChatSession';
import ChatPillButton from './ChatPillButton';
import ChatMessageItem from './ChatMessageItem';
import { QUICK_PROMPTS } from './ChatQuickPrompts';

export const FloatingChatWidget = ({ isOpen, onToggle, onOpenAppointment }) => {
  const [modalInput, setModalInput] = useState('');
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const chatMessagesContainerRef = useRef(null);

  // 1. Lock background page body scroll when chat modal is open
  useBodyScrollLock(isOpen);

  // 2. Track footer overlap to morph into FAB earlier before reaching footer and stay lifted above it
  const { isFooterVisible, bottomOffset } = useFooterOverlap('site-footer', 24, 180);

  // 3. Connect to chat session hook
  const {
    messages,
    isTyping,
    errorNotice,
    sendUserMessage,
    clearErrorNotice,
  } = useChatSession();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onToggle) {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  // Isolated container scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTo({
        top: chatMessagesContainerRef.current.scrollHeight,
        behavior,
      });
      setIsUserScrolledUp(false);
    }
  }, []);

  const handleContainerScroll = () => {
    if (!chatMessagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setIsUserScrolledUp(distanceFromBottom > 90);
  };

  // Immediate scroll on modal open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        scrollToBottom('auto');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBottom]);

  // When messages update or bot types: auto-scroll ONLY if user is near bottom
  useEffect(() => {
    if (isOpen && !isUserScrolledUp) {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping, isOpen, isUserScrolledUp, scrollToBottom]);

  const handleSendMessage = useCallback(
    (textToSend) => {
      const text = (textToSend || modalInput).trim();
      if (!text) return;

      if (!isOpen && onToggle) {
        onToggle();
      }

      setModalInput('');
      setIsUserScrolledUp(false);
      sendUserMessage(text);
    },
    [modalInput, isOpen, onToggle, sendUserMessage]
  );

  return (
    <>
      {/* ── 1. Floating Pill & Bottom FAB ── */}
      <ChatPillButton
        isOpen={isOpen}
        onToggle={onToggle}
        onSubmitText={handleSendMessage}
        isFooterVisible={isFooterVisible}
        bottomOffset={bottomOffset}
      />

      {/* ── 2. Full-Width / Full-Screen Popup Chat Modal ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="دستیار هوشمند تریاژ و مشاوره آنلاین"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-fadeSlide"
        >
          <div
            className="w-full h-[100dvh] md:h-[86vh] md:max-w-5xl md:rounded-[2.5rem] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border-0 md:border md:border-primary/30 flex flex-col shadow-2xl overflow-hidden relative"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 sm:px-5 py-3 md:py-4 bg-white/80 backdrop-blur-xl border-b border-primary/20 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md shrink-0">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm md:text-base font-black text-textDark flex items-center gap-1.5">
                    دستیار هوشمند تریاژ و مشاوره
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </h3>
                  <p className="text-[10px] sm:text-xs text-primary font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    پاسخگویی سریع به علائم بالینی و تریاژ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-textDark/60 hover:text-primary transition-colors p-2 rounded-full hover:bg-white/80 cursor-pointer"
                  aria-label="بستن پنجره چت"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column Desktop, 1-Column Mobile */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Desktop Sidebar: Quick Topics */}
              <div className="hidden md:flex flex-col w-72 bg-white/40 border-l border-primary/15 p-5 shrink-0 overflow-y-auto chat-scroll">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  موضوعات پرتکرار تریاژ
                </h4>
                <p className="text-xs text-textDark/70 mb-4 font-medium leading-relaxed">
                  روی هر گزینه کلیک کنید تا پاسخ مرتبط را فوراً دریافت نمایید:
                </p>

                <div className="flex flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (prompt.isBooking && onOpenAppointment) {
                            onToggle();
                            onOpenAppointment();
                          } else {
                            handleSendMessage(prompt.text);
                          }
                        }}
                        className={`text-right p-3 rounded-2xl text-xs font-bold border transition-all flex items-start gap-2.5 cursor-pointer ${
                          prompt.isUrgent
                            ? 'bg-red-500/10 border-red-500/30 text-red-700 hover:bg-red-500/20'
                            : 'bg-white/70 border-primary/20 text-textDark hover:bg-white hover:border-primary hover:text-primary shadow-xs'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto pt-4 border-t border-primary/15">
                  <button
                    type="button"
                    onClick={() => {
                      onToggle();
                      if (onOpenAppointment) onOpenAppointment();
                    }}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    رزرو نوبت ویزیت حضوری
                  </button>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white/20 relative">
                {/* Mobile Quick Chips */}
                <div className="md:hidden flex gap-1.5 p-2 sm:p-2.5 overflow-x-auto border-b border-primary/10 bg-white/50 shrink-0 chat-scroll">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (prompt.isBooking && onOpenAppointment) {
                          onToggle();
                          onOpenAppointment();
                        } else {
                          handleSendMessage(prompt.text);
                        }
                      }}
                      className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 transition-all cursor-pointer ${
                        prompt.isUrgent
                          ? 'bg-red-500/10 border-red-500/30 text-red-600'
                          : 'bg-white/80 border-primary/20 text-textDark'
                      }`}
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>

                {/* Error Notice Banner */}
                {errorNotice && (
                  <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-800 font-bold shrink-0">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-amber-600 shrink-0" />
                      <span>{errorNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearErrorNotice}
                      className="p-1 hover:bg-amber-500/20 rounded-lg cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* Messages List (Isolated container scroll) */}
                <div
                  ref={chatMessagesContainerRef}
                  onScroll={handleContainerScroll}
                  className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 chat-scroll relative"
                  style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                >
                  {messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      onOpenAppointment={onOpenAppointment}
                      onToggleChat={onToggle}
                    />
                  ))}

                  {isTyping && (
                    <div className="bg-white/85 border border-primary/20 p-3 rounded-2xl rounded-tl-sm self-end shadow-xs flex items-center justify-center gap-1.5 w-14 h-10">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      ></span>
                    </div>
                  )}

                  {/* Scroll to bottom button if user scrolled up */}
                  {isUserScrolledUp && (
                    <button
                      type="button"
                      onClick={() => scrollToBottom('smooth')}
                      className="sticky bottom-2 self-center bg-primary/95 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1 hover:bg-primary transition-all cursor-pointer z-10 animate-fadeIn"
                    >
                      <ChevronDown size={14} />
                      <span>پیام‌های جدید</span>
                    </button>
                  )}
                </div>

                {/* Modal Input Bar */}
                <div className="p-3 sm:p-4 bg-white/85 border-t border-primary/20 backdrop-blur-xl shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2 max-w-4xl mx-auto"
                  >
                    <input
                      type="text"
                      placeholder="علائم، پرسش پزشکی یا دلیل مراجعه خود را بنویسید..."
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      disabled={isTyping}
                      className="flex-1 bg-white border border-primary/30 shadow-inner rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm md:text-sm text-textDark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-textDark/45 font-medium disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !modalInput.trim()}
                      aria-label="ارسال پیام"
                      className="bg-primary hover:bg-primary-dark text-white rounded-xl sm:rounded-2xl w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-md shadow-primary/30 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 rotate-180" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
