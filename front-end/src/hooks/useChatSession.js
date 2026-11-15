// src/hooks/useChatSession.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../api/chatService';
import useAuthStore from '../store/authStore';
import { toPersianDigits } from '../utils/jalaliDateUtils';

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
    isNew: false,
  },
];

const getCurrentTimeDisplay = () => {
  const formatted = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
  return toPersianDigits(formatted);
};

export const useChatSession = () => {
  const [sessionId, setSessionId] = useState(getInitialSessionId);
  const [messages, setMessages] = useState(INITIAL_BOT_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const pendingMessageRef = useRef(null);
  const prevAuthRef = useRef(isAuthenticated);

  // If user changes or session resets
  const resetSession = useCallback(() => {
    try {
      const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(STORAGE_SESSION_KEY, newId);
      setSessionId(newId);
    } catch {
      setSessionId(`sess_${Date.now()}`);
    }
    pendingMessageRef.current = null;
    setMessages(INITIAL_BOT_MESSAGES);
    setErrorNotice(null);
  }, []);

  // Internal dispatcher for triage API communication
  const dispatchTriageBackend = useCallback(
    async (textToSend) => {
      if (!textToSend) return;
      setIsTyping(true);
      setErrorNotice(null);

      try {
        const res = await chatService.sendMessage(textToSend, sessionId);

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
            isNew: true,
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
              isNew: true,
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
              isNew: true,
            },
          ]);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, openAuthModal, resetSession]
  );

  // Reactive auto-dismiss of auth prompt and auto-dispatch of pending user message upon login
  useEffect(() => {
    // Detect transition from unauthenticated (false) to authenticated (true)
    if (!prevAuthRef.current && isAuthenticated) {
      // 1. Mark existing auth prompt messages as dismissing (triggers CSS smooth fade & collapse)
      setMessages((prev) => {
        const hasAuthPrompt = prev.some((msg) => msg.requiresAuth);
        if (!hasAuthPrompt) return prev;
        return prev.map((msg) =>
          msg.requiresAuth ? { ...msg, isDismissing: true } : msg
        );
      });

      // 2. After 350ms exit animation, remove them from state and dispatch pending message
      const timer = setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => !msg.requiresAuth));

        // Auto-send pending message if user had submitted one before authenticating
        if (pendingMessageRef.current) {
          const pendingText = pendingMessageRef.current;
          pendingMessageRef.current = null;
          dispatchTriageBackend(pendingText);
        }
      }, 350);

      prevAuthRef.current = isAuthenticated;
      return () => clearTimeout(timer);
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, dispatchTriageBackend]);

  const sendUserMessage = useCallback(
    async (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || isTyping) return;

      const time = getCurrentTimeDisplay();

      // Check authentication before sending
      if (!isAuthenticated) {
        pendingMessageRef.current = trimmed;
        // Add user message & bot login prompt
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
            isNew: true,
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

      await dispatchTriageBackend(trimmed);
    },
    [isTyping, isAuthenticated, openAuthModal, dispatchTriageBackend]
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
