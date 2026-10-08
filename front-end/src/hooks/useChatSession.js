// src/hooks/useChatSession.js
import { useState, useCallback, useEffect } from 'react';
import { chatService } from '../api/chatService';
import useAuthStore from '../store/authStore';

const STORAGE_SESSION_KEY = 'kamelion_triage_session_id';

const getInitialSessionId = () => {
  try {
    const stored = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (stored) return stored;
    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(STORAGE_SESSION_KEY, newId);
    return newId;
  } catch {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
};

const INITIAL_BOT_MESSAGES = [
  {
    id: 'bot-welcome',
    sender: 'bot',
    text: 'سلام! من دستیار هوشمند تریاژ مطب دکتر معشوری هستم. لطفاً دلیل مراجعه، علائم یا سوال خود را بنویسید تا شما را راهنمایی کنم.',
    time: 'اکنون',
  },
];

const getCurrentTimeDisplay = () => {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
};

export const useChatSession = () => {
  const [sessionId, setSessionId] = useState(getInitialSessionId);
  const [messages, setMessages] = useState(INITIAL_BOT_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  // If user changes or session resets
  const resetSession = useCallback(() => {
    try {
      const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(STORAGE_SESSION_KEY, newId);
      setSessionId(newId);
    } catch {
      setSessionId(`sess_${Date.now()}`);
    }
    setMessages(INITIAL_BOT_MESSAGES);
    setErrorNotice(null);
  }, []);

  const sendUserMessage = useCallback(
    async (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || isTyping) return;

      const time = getCurrentTimeDisplay();

      // Check authentication before sending
      if (!isAuthenticated) {
        // Add user message
        setMessages((prev) => [
          ...prev,
          {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: trimmed,
            time,
          },
          {
            id: `bot-auth-${Date.now()}`,
            sender: 'bot',
            text: 'برای دریافت پاسخ از دستیار تریاژ و ذخیره سوابق پزشکی، لطفاً ابتدا وارد حساب کاربری خود شوید.',
            requiresAuth: true,
            time,
          },
        ]);
        if (openAuthModal) {
          openAuthModal();
        }
        return;
      }

      // Add user message to state
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: trimmed,
          time,
        },
      ]);

      setIsTyping(true);
      setErrorNotice(null);

      try {
        const res = await chatService.sendMessage(trimmed, sessionId);

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: res.reply,
            triageLevel: res.triageLevel,
            bookingOffer: res.bookingOffer,
            emergencyCode: res.emergencyCode,
            fallback: res.fallback,
            isEmergency: res.isEmergency,
            showBookingAction: res.showBookingAction,
            time: getCurrentTimeDisplay(),
          },
        ]);
      } catch (err) {
        const status = err?.response?.status;

        if (status === 401) {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-err-${Date.now()}`,
              sender: 'bot',
              text: 'نشست کاربری شما منقضی شده است. لطفاً مجدداً وارد حساب کاربری شوید.',
              requiresAuth: true,
              time: getCurrentTimeDisplay(),
            },
          ]);
          if (openAuthModal) openAuthModal();
        } else if (status === 409) {
          setErrorNotice('یک پیام دیگر در حال پاسخ‌گویی است. لطفاً چند لحظه تأمل فرمایید.');
        } else if (status === 403) {
          // Session owned by another patient -> rotate session id and inform
          resetSession();
          setErrorNotice('نشست قبلی بازنشانی شد. لطفاً پیام خود را مجدداً ارسال فرمایید.');
        } else {
          // General server fallback or network issue
          const fallbackText =
            err?.response?.data?.detail ||
            'ارتباط با سرور دستیار تریاژ با اختلال مواجه شد. در صورت فوریت بالینی با شماره مطب تماس حاصل فرمایید.';
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-err-${Date.now()}`,
              sender: 'bot',
              text: fallbackText,
              fallback: true,
              time: getCurrentTimeDisplay(),
            },
          ]);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, isTyping, isAuthenticated, openAuthModal, resetSession]
  );

  return {
    messages,
    isTyping,
    errorNotice,
    sessionId,
    sendUserMessage,
    resetSession,
    clearErrorNotice: () => setErrorNotice(null),
  };
};

export default useChatSession;
