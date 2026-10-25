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
import TypingIndicator from './TypingIndicator';
import { QUICK_PROMPTS } from './ChatQuickPrompts';

export const FloatingChatWidget = ({ isOpen, onToggle, onOpenAppointment }) => {
  const [modalInput, setModalInput] = useState('');
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const chatMessagesContainerRef = useRef(null);
  const lastScrollTimeRef = useRef(0);
  const modalInputRef = useRef(null);
  const modalRef = useRef(null);

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

  // 4. Dynamic Visual Viewport & Mobile Virtual Keyboard Height Tracking
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const windowHeight = window.innerHeight;
      const mobileCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck);

      if (window.visualViewport) {
        const vv = window.visualViewport;
        const currentKeyboardHeight = Math.max(0, windowHeight - vv.height - (vv.offsetTop || 0));
        setViewportHeight(vv.height);
        setKeyboardOffset(currentKeyboardHeight);
      } else {
        setViewportHeight(windowHeight);
        setKeyboardOffset(0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);

    updateViewport();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  // 5. Mobile Touch Drag-Down to Collapse/Close
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const [dragTranslateY, setDragTranslateY] = useState(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    touchCurrentY.current = currentY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff > 80) {
      handleClose();
    }
    setDragTranslateY(0);
  };

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onToggle) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  const handleClose = useCallback(() => {
    setDragTranslateY(0);
    onToggle?.(false);
  }, [onToggle]);

  // Synchronous auto-expand handler called when user focuses/clicks/types in compact bar
  const handleExpand = useCallback(
    (initialText = '') => {
      if (typeof initialText === 'string' && initialText.trim()) {
        setModalInput(initialText);
      }
      onToggle?.(true);

      if (modalInputRef.current) {
        modalInputRef.current.focus({ preventScroll: true });
        const len = modalInputRef.current.value.length;
        modalInputRef.current.setSelectionRange?.(len, len);
      }
    },
    [onToggle]
  );

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
    setIsUserScrolledUp(distanceFromBottom > 85);
  };

  // Smooth auto-scroll tracking triggered as words reveal
  const handleScrollOnWord = useCallback(
    (force = false) => {
      if (!isOpen || isUserScrolledUp || !chatMessagesContainerRef.current) return;
      const now = performance.now();
      if (force || now - lastScrollTimeRef.current > 50) {
        lastScrollTimeRef.current = now;
        chatMessagesContainerRef.current.scrollTo({
          top: chatMessagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    },
    [isOpen, isUserScrolledUp]
  );

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
        onToggle(true);
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
        onExpand={handleExpand}
        onSubmitText={handleSendMessage}
        inputValue={modalInput}
        setInputValue={setModalInput}
        isFooterVisible={isFooterVisible}
        bottomOffset={bottomOffset}
        onOpenAppointment={onOpenAppointment}
      />

      {/* ── 2. Full-Width / Full-Screen Popup Chat Modal ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label="دستیار هوشمند تریاژ و مشاوره آنلاین"
        className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? 'bg-black/60 backdrop-blur-md opacity-100 pointer-events-auto'
            : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div
          ref={modalRef}
          style={{
            '--visual-viewport-height': `${viewportHeight}px`,
            height: isMobile ? `${viewportHeight}px` : undefined,
            maxHeight: isMobile ? `${viewportHeight}px` : undefined,
            transform: dragTranslateY > 0 ? `translateY(${dragTranslateY}px)` : undefined,
            overscrollBehavior: 'contain',
          }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-h-[var(--visual-viewport-height,100dvh)] md:max-h-[86vh] md:h-[86vh] md:max-w-5xl rounded-t-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-bgLight/95 via-white/95 to-bgDark/95 backdrop-blur-2xl border-t md:border border-primary/30 flex flex-col shadow-2xl overflow-hidden relative transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen
              ? 'translate-y-0 scale-100'
              : 'translate-y-full md:translate-y-12 md:scale-95'
          }`}
        >
          {/* Mobile Sheet Drag Handle Pill */}
          <div
            className="md:hidden w-full flex flex-col items-center pt-2 pb-1 bg-white/90 cursor-grab active:cursor-grabbing touch-none select-none border-b border-primary/10"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleClose}
            aria-label="بستن پنجره گفتگو"
            title="بستن و کوچک کردن"
          >
            <div className="w-10 h-1 bg-textDark/25 rounded-full mb-1" />
            <span className="text-[10px] text-textDark/50 font-bold flex items-center gap-1">
              <ChevronDown size={12} />
              برای بستن به پایین بکشید
            </span>
          </div>

          {/* Modal Header */}
          <div
            className="flex justify-between items-center px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-white/80 backdrop-blur-xl border-b border-primary/20 shrink-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md shrink-0">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6" />
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

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClose}
                className="text-textDark/60 hover:text-primary hover:bg-white/80 transition-colors p-2 rounded-xl flex items-center gap-1 text-xs font-bold cursor-pointer"
                aria-label="کوچک کردن پنجره چت"
                title="کوچک کردن"
              >
                <span className="hidden sm:inline text-[11px] text-textDark/70">کوچک کردن</span>
                <ChevronDown className="w-4 h-4 md:hidden text-primary" />
                <X className="hidden md:block w-5 h-5" />
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
                          onToggle?.(false);
                          onOpenAppointment();
                        } else {
                          handleSendMessage(prompt.text);
                        }
                      }}
                      className={`chat-suggestion-chip text-right p-3 rounded-2xl text-xs font-bold border shrink-0 cursor-pointer select-none shadow-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-start gap-2.5 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 motion-reduce:transition-none ${
                        prompt.isUrgent
                          ? 'bg-rose-600 border-rose-700/80 text-white hover:brightness-110 hover:border-rose-600 hover:shadow-md hover:shadow-rose-600/30 active:brightness-90 focus-visible:ring-rose-500'
                          : 'bg-white/95 border-primary/20 text-textDark hover:bg-primary/10 hover:border-primary/50 hover:brightness-105 hover:shadow-md hover:shadow-primary/15 active:bg-primary/15 active:brightness-95 focus-visible:ring-primary'
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
                    onToggle?.(false);
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
                        onToggle?.(false);
                        onOpenAppointment();
                      } else {
                        handleSendMessage(prompt.text);
                      }
                    }}
                    className={`chat-suggestion-chip whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 cursor-pointer select-none shadow-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 motion-reduce:transition-none ${
                      prompt.isUrgent
                        ? 'bg-rose-600 border-rose-700/80 text-white hover:brightness-110 hover:border-rose-600 hover:shadow-md hover:shadow-rose-600/30 active:brightness-90 focus-visible:ring-rose-500'
                        : 'bg-white/95 backdrop-blur-md border-primary/20 text-textDark hover:bg-primary/10 hover:border-primary/50 hover:brightness-105 hover:shadow-md hover:shadow-primary/15 active:bg-primary/15 active:brightness-95 focus-visible:ring-primary'
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
                {/* Official Medical & AI Disclaimer Banner - High Contrast Card */}
                <div className="bg-white border border-amber-200 shadow-sm rounded-2xl p-3 sm:p-3.5 shrink-0 mb-1 flex items-start gap-2.5 text-right">
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

                {messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    onOpenAppointment={onOpenAppointment}
                    onToggleChat={() => onToggle?.(!isOpen)}
                    onScrollToBottom={handleScrollOnWord}
                  />
                ))}

                {/* Loading Dots Indicator */}
                {isTyping && <TypingIndicator />}

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

              {/* Modal Input Bar with Medical Disclaimer */}
              <div
                className={`p-3 sm:p-4 bg-white/90 border-t border-primary/20 backdrop-blur-xl shrink-0 transition-all ${
                  keyboardOffset > 0
                    ? 'pb-2.5 sm:pb-3'
                    : 'pb-[calc(0.75rem+env(safe-area-inset-bottom))]'
                }`}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2 max-w-4xl mx-auto items-center"
                >
                  <input
                    ref={modalInputRef}
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
    </>
  );
};

export default FloatingChatWidget;