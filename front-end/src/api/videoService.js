import apiClient from '../lib/apiClient';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const videoService = {
  /**
   * Fetches the clinical video gallery items.
   * Endpoint: GET /videos/ (Public)
   */
  getVideos: async () => {
    const response = await apiClient.get('/videos/');
    return extractResults(response.data);
  },

  /**
   * Admin upload or link a new educational video.
   * Endpoint: POST /admin/videos/ (JWT IsAdminUser)
   */
  createVideo: async (videoData) => {
    const response = await apiClient.post('/admin/videos/', videoData);
    return response.data;
  },

  /**
   * Admin delete a video item from the gallery.
   * Endpoint: DELETE /admin/videos/<id>/ (JWT IsAdminUser)
   */
  deleteVideo: async (id) => {
    const response = await apiClient.delete(`/admin/videos/${id}/`);
    return response.data;
  },
};

export default videoService;
