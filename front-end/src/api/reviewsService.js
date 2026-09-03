import apiClient from '../lib/apiClient';

const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const reviewsService = {
  /**
   * Fetches public approved patient reviews and testimonials.
   * Endpoint: GET /reviews/ (Public)
   */
  getApprovedReviews: async () => {
    const response = await apiClient.get('/reviews/');
    return extractResults(response.data);
  },

  /**
   * Submits a new patient review or comment.
   * Endpoint: POST /reviews/ (Public)
   */
  submitReview: async (reviewData) => {
    const trimmedName = reviewData.name?.trim();
    const payload = {
      name: trimmedName || 'کاربر گرامی',
      email: reviewData.email?.trim() || '',
      text: reviewData.text?.trim() || '',
      rating: Number(reviewData.rating) || 5,
    };
    const response = await apiClient.post('/reviews/', payload);
    return response.data;
  },

  /**
   * Fetches all reviews (including pending / unapproved) for admin moderation.
   * Endpoint: GET /admin/reviews/ (JWT IsAdminUser)
   */
  getAdminReviews: async () => {
    const response = await apiClient.get('/admin/reviews/');
    return extractResults(response.data);
  },

  /**
   * Approves or hides a patient review.
   * Endpoint: PATCH /admin/reviews/<id>/ or /admin/reviews/<id>/approval/ (JWT IsAdminUser)
   */
  updateReviewApproval: async (id, approved) => {
    try {
      const response = await apiClient.patch(`/admin/reviews/${id}/`, {
        approved,
      });
      return response.data;
    } catch (err) {
      // Try secondary route convention if default gives 404
      if (err?.response?.status === 404) {
        const response = await apiClient.patch(`/admin/reviews/${id}/approval/`, {
          approved,
        });
        return response.data;
      }
      throw err;
    }
  },

  /**
   * Deletes a patient review.
   * Endpoint: DELETE /admin/reviews/<id>/ (JWT IsAdminUser)
   */
  deleteReview: async (id) => {
    const response = await apiClient.delete(`/admin/reviews/${id}/`);
    return response.data;
  },
};

export default reviewsService;
