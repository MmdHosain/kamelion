import apiClient from '../lib/apiClient';

export const chatService = {
  /**
   * Sends a message to the AI Smart Triage LLM Gateway.
   * Endpoint: POST /chat/message (Public or Authenticated)
   */
  sendMessage: async (message, sessionId = null, context = {}) => {
    const payload = {
      message,
      session_id: sessionId || `session_${Date.now()}`,
      context,
    };

    const response = await apiClient.post('/chat/message', payload);
    const data = response.data;

    return {
      reply: data.reply || data.response || data.message || '',
      isEmergency: Boolean(data.is_emergency || data.isEmergency),
      emergencyCode: data.emergency_code || data.emergencyCode || null,
      showBookingAction: Boolean(data.show_booking || data.showBookingAction || data.suggest_booking),
    };
  },
};

export default chatService;
