// src/api/adminAiService.js
import apiClient from '../lib/apiClient';

/**
 * Service for Admin AI Testing and Playground Diagnostics.
 * Communicates with dedicated admin testing endpoints.
 */
export const adminAiService = {
  /**
   * Sends a test message to the AI Gateway with rich inspector diagnostics and context toggles.
   *
   * @param {object} params
   * @param {string} params.message - Message text
   * @param {string} params.sessionId - Stable test session identifier
   * @param {boolean} [params.includeHistory=true] - Whether to send previous conversation turns
   * @param {boolean} [params.includePatient=true] - Whether to send patient demographics
   * @param {boolean} [params.includeTriage=true] - Whether to send prior triage level
   * @param {object|null} [params.simulatedPatient] - Optional simulated patient demographics { name, age, sex }
   */
  sendTestMessage: async ({
    message,
    sessionId,
    includeHistory = true,
    includePatient = true,
    includeTriage = true,
    simulatedPatient = null,
  }) => {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('متن پیام تست الزامی است.');
    }
    if (!sessionId) {
      throw new Error('شناسه نشست تست الزامی است.');
    }

    const payload = {
      message: message.trim(),
      session_id: String(sessionId).slice(0, 100),
      include_history: Boolean(includeHistory),
      include_patient: Boolean(includePatient),
      include_triage: Boolean(includeTriage),
      simulated_patient: simulatedPatient || null,
    };

    try {
      const response = await apiClient.post('/admin/chat/test/message/', payload);
      const data = response.data;

      return {
        reply: data.reply || '',
        triageLevel: data.triage_level || 'unknown',
        triageSummary: data.triage_summary || null,
        bookingOffer: Boolean(data.booking_offer),
        emergencyCode: data.emergency_code || null,
        fallback: Boolean(data.fallback),
        sessionId: data.session_id || sessionId,
        aiSessionId: data.ai_session_id || null,
        historyCount: Number(data.history_count || 0),
        latencyMs: Number(data.latency_ms || 0),
        outboundPayload: data.outbound_payload || null,
        aiResponse: data.ai_response || null,
        appliedToggles: data.applied_toggles || {},
        clientPayload: payload,
      };
    } catch (err) {
      // Fallback if admin endpoint fails or falls back to public chat endpoint
      if (err?.response?.status === 404) {
        const response = await apiClient.post('/chat/message', {
          message: payload.message,
          session_id: payload.session_id,
        });
        const data = response.data;
        return {
          reply: data.reply || '',
          triageLevel: data.triage_level || 'unknown',
          triageSummary: null,
          bookingOffer: Boolean(data.booking_offer),
          emergencyCode: data.emergency_code || null,
          fallback: Boolean(data.fallback),
          sessionId,
          aiSessionId: null,
          historyCount: 1,
          latencyMs: 0,
          outboundPayload: null,
          aiResponse: null,
          appliedToggles: {},
          clientPayload: payload,
        };
      }
      throw err;
    }
  },

  /**
   * Resets test session memory using one of 4 granular modes.
   *
   * @param {string} sessionId
   * @param {'soft'|'hard'|'triage'|'global_test'} [mode='hard']
   * @returns {Promise<{ success: boolean, detail: string, mode: string, deletedMessagesCount?: number, deletedSessionsCount?: number }>}
   */
  resetSessionMemory: async (sessionId, mode = 'hard') => {
    try {
      const response = await apiClient.post('/admin/chat/test/reset/', {
        session_id: sessionId || '',
        mode,
      });
      return {
        success: true,
        detail: response.data?.detail || 'عملیات ریست با موفقیت انجام شد.',
        mode: response.data?.mode || mode,
        deletedMessagesCount: response.data?.deleted_messages_count || 0,
        deletedSessionsCount: response.data?.deleted_sessions_count || 0,
      };
    } catch (err) {
      console.warn('Backend reset call notice:', err?.response?.data || err?.message);
      return {
        success: false,
        detail: err?.response?.data?.detail || 'خطا در برقراری ارتباط با سرور برای بازنشانی.',
        mode,
        deletedMessagesCount: 0,
      };
    }
  },
};

export default adminAiService;
