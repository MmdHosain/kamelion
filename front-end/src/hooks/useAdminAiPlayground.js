// src/hooks/useAdminAiPlayground.js
import { useState, useCallback } from 'react';
import adminAiService from '../api/adminAiService';
import { toPersianDigits } from '../utils/jalaliDateUtils';

export const generateNewSessionId = () => {
  return `test_admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

const getNowTimeDisplay = () => {
  const formatted = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
  return toPersianDigits(formatted);
};

const INITIAL_TEST_MESSAGES = [
  {
    id: 'sys-intro',
    role: 'system',
    content: 'محیط آزمایشگاهی هوش مصنوعی آماده است. پیام‌های تست خود را ارسال کنید یا از پرامپت‌های بالینی آماده استفاده نمایید.',
    time: 'آماده تست',
  },
];

export const useAdminAiPlayground = () => {
  const [sessionId, setSessionId] = useState(generateNewSessionId);
  const [messages, setMessages] = useState(INITIAL_TEST_MESSAGES);
  const [isSending, setIsSending] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const [resetNotice, setResetNotice] = useState(null);

  // Context & Feature Toggles
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includePatient, setIncludePatient] = useState(true);
  const [includeTriage, setIncludeTriage] = useState(true);
  const [simulatedPatient, setSimulatedPatient] = useState(null);

  // Rich Inspector Diagnostics
  const [inspectorData, setInspectorData] = useState({
    outboundPayload: null,
    aiResponse: null,
    clientPayload: null,
    appliedToggles: {},
    triageLevel: 'unknown',
    triageSummary: null,
    fallback: false,
    bookingOffer: false,
    emergencyCode: null,
    latencyMs: 0,
    historyCount: 0,
    aiSessionId: null,
    lastUpdatedTime: null,
  });

  const sendPrompt = useCallback(
    async (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || isSending) return;

      const userTime = getNowTimeDisplay();
      const userMsgId = `usr-${Date.now()}`;

      // Append user test message
      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: 'user',
          content: trimmed,
          time: userTime,
        },
      ]);

      setIsSending(true);
      setErrorNotice(null);
      setResetNotice(null);

      try {
        const res = await adminAiService.sendTestMessage({
          message: trimmed,
          sessionId,
          includeHistory,
          includePatient,
          includeTriage,
          simulatedPatient,
        });

        const botTime = getNowTimeDisplay();

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: res.reply,
            triageLevel: res.triageLevel,
            triageSummary: res.triageSummary,
            bookingOffer: res.bookingOffer,
            emergencyCode: res.emergencyCode,
            fallback: res.fallback,
            latencyMs: res.latencyMs,
            time: botTime,
          },
        ]);

        setInspectorData({
          outboundPayload: res.outboundPayload,
          aiResponse: res.aiResponse,
          clientPayload: res.clientPayload,
          appliedToggles: res.appliedToggles,
          triageLevel: res.triageLevel,
          triageSummary: res.triageSummary,
          fallback: res.fallback,
          bookingOffer: res.bookingOffer,
          emergencyCode: res.emergencyCode,
          latencyMs: res.latencyMs,
          historyCount: res.historyCount,
          aiSessionId: res.aiSessionId,
          lastUpdatedTime: botTime,
        });
      } catch (err) {
        const errorMsg =
          err?.response?.data?.detail ||
          err?.message ||
          'خطا در برقراری ارتباط با درگاه تست هوش مصنوعی.';

        setErrorNotice(errorMsg);

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'error',
            content: `خطا در دریافت پاسخ: ${errorMsg}`,
            time: getNowTimeDisplay(),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending, includeHistory, includePatient, includeTriage, simulatedPatient]
  );

  /**
   * Multi-mode reset handler:
   *  - 'soft': new session ID without touching database
   *  - 'hard': wipes current session & messages from database
   *  - 'triage': resets triage level and actions, keeping conversation messages
   *  - 'global_test': wipes all test sessions from database
   */
  const resetMemory = useCallback(
    async (mode = 'hard') => {
      const targetSessionId = sessionId;
      setErrorNotice(null);

      if (mode === 'triage') {
        // Triage Reset keeps messages and sessionId, but clears triage state on server
        try {
          const res = await adminAiService.resetSessionMemory(targetSessionId, 'triage');
          setInspectorData((prev) => ({
            ...prev,
            triageLevel: 'unknown',
            triageSummary: null,
            bookingOffer: false,
            emergencyCode: null,
            lastUpdatedTime: getNowTimeDisplay(),
          }));
          setResetNotice(
            res.success
              ? 'سطح تریاژ، خلاصه و کدهای ارجاع ریست شدند؛ پیام‌های مکالمه حفظ شدند.'
              : res.detail
          );
        } catch {
          setResetNotice('خطا در بازنشانی تریاژ.');
        }
        return;
      }

      // For soft, hard, and global_test: Generate a fresh session ID and reset local conversation
      const newSession = generateNewSessionId();
      setSessionId(newSession);
      setMessages(INITIAL_TEST_MESSAGES);

      setInspectorData({
        outboundPayload: null,
        aiResponse: null,
        clientPayload: null,
        appliedToggles: {},
        triageLevel: 'unknown',
        triageSummary: null,
        fallback: false,
        bookingOffer: false,
        emergencyCode: null,
        latencyMs: 0,
        historyCount: 0,
        aiSessionId: null,
        lastUpdatedTime: null,
      });

      if (mode === 'soft') {
        setResetNotice('ریست نرم انجام شد: شناسه نشست نو شد و سوابق قبلی در دیتابیس حفظ گردید.');
        return;
      }

      if (mode === 'global_test') {
        try {
          const res = await adminAiService.resetSessionMemory('', 'global_test');
          setResetNotice(
            res.success
              ? `تمامی داده‌های تستی پاک‌سازی شدند (${toPersianDigits(res.deletedSessionsCount || 0)} نشست و ${toPersianDigits(res.deletedMessagesCount || 0)} پیام).`
              : res.detail
          );
        } catch {
          setResetNotice('خطا در پاک‌سازی سراسری نشست‌های تستی.');
        }
        return;
      }

      // Default: mode === 'hard'
      try {
        const res = await adminAiService.resetSessionMemory(targetSessionId, 'hard');
        setResetNotice(
          res.success
            ? `نشست جاری با موفقیت پاک‌سازی شد (${toPersianDigits(res.deletedMessagesCount || 0)} پیام حذف شد).`
            : 'نشست نو آغاز شد.'
        );
      } catch {
        setResetNotice('شناسه نشست نو شد و حافظه کلاینت ریست گردید.');
      }
    },
    [sessionId]
  );

  return {
    sessionId,
    messages,
    isSending,
    errorNotice,
    resetNotice,
    inspectorData,
    // Toggles
    includeHistory,
    setIncludeHistory,
    includePatient,
    setIncludePatient,
    includeTriage,
    setIncludeTriage,
    simulatedPatient,
    setSimulatedPatient,
    // Actions
    sendPrompt,
    resetMemory,
    clearErrorNotice: () => setErrorNotice(null),
    clearResetNotice: () => setResetNotice(null),
  };
};

export default useAdminAiPlayground;
