import apiClient from '../lib/apiClient';

/**
 * Service for managing the Active Urgent Patients Queue.
 * Endpoint: GET /api/admin/patients/urgent/
 * Access: Admin only (is_staff = true)
 */
export const urgentPatientsService = {
  /**
   * Fetches paginated active urgent patients with valid emergency referral codes.
   *
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.pageSize=10]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<{
   *   count: number,
   *   next: string|null,
   *   previous: string|null,
   *   results: Array<{
   *     id: number,
   *     full_name: string,
   *     phone_number: string,
   *     chat_id: number,
   *     session_id: string,
   *     triage_level: string,
   *     triage_summary: string|null,
   *     assessed_at: string,
   *     emergency_code: string,
   *     emergency_code_issued_at: string,
   *     emergency_code_expires_at: string,
   *     emergency_code_is_expired: boolean
   *   }>
   * }>}
   */
  async list({ page = 1, pageSize = 10, signal } = {}) {
    const { data } = await apiClient.get('/admin/patients/urgent/', {
      params: { page, page_size: pageSize },
      signal,
    });
    return data;
  },
};

export default urgentPatientsService;

