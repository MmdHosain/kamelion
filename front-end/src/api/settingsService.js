import apiClient from '../lib/apiClient';

export const settingsService = {
  /**
   * Fetches the global active site theme.
   * Endpoint: GET /settings/theme (Public)
   */
  getTheme: async () => {
    try {
      const response = await apiClient.get('/settings/theme');
      const data = response.data;
      // Handle both string response or object like { theme: 'pink' } or { id: 'pink' }
      if (typeof data === 'string') return data;
      if (data?.theme) return data.theme;
      if (data?.id) return data.id;
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Saves the global site theme across all clinic visitors.
   * Endpoint: PUT /admin/settings/theme (Requires Admin JWT)
   */
  saveTheme: async (themeKey) => {
    const response = await apiClient.put('/admin/settings/theme', {
      theme: themeKey,
    });
    return response.data;
  },
};

export default settingsService;
