import apiClient from '../lib/apiClient';

/**
 * Service for communicating with the AI Smart Triage Chat Gateway.
 * Backend endpoint: POST /api/chat/message
 * Requires authenticated patient JWT.
 */
export const chatService = {
  /**
   * Sends a patient message to the triage gateway.
   *
   * @param {string} message - Message text (1-4000 chars after trimming)
   * @param {string} sessionId - Stable session identifier (max 100 chars)
   * @returns {Promise<{
   *   reply: string,
   *   triageLevel: string,
   *   bookingOffer: boolean,
   *   emergencyCode: string|null,
   *   fallback: boolean,
   *   isEmergency: boolean,
   *   showBookingAction: boolean
   * }>}
   */
  sendMessage: async (message, sessionId) => {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('متن پیام الزامی است.');
    }

    if (!sessionId) {
      throw new Error('شناسه نشست چت الزامی است.');
    }

    const payload = {
      message: message.trim(),
      session_id: String(sessionId).slice(0, 100),
    };

    const response = await apiClient.post('/chat/message', payload);
    const data = response.data;

    const triageLevel = data.triage_level || 'unknown';
    const bookingOffer = Boolean(data.booking_offer);
    const emergencyCode = data.emergency_code || null;
    const fallback = Boolean(data.fallback);

    return {
      reply: data.reply || '',
      triageLevel,
      bookingOffer,
      emergencyCode,
      fallback,
      // Backward-compatibility helpers for UI
      isEmergency: triageLevel === 'urgent' || Boolean(emergencyCode),
      showBookingAction: bookingOffer,
    };
  },
};

export default chatService;
