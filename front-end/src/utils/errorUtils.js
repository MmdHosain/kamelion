// src/utils/errorUtils.js

/**
 * Parses API errors dynamically, returning the most relevant error message.
 * @param {Object} error - The caught error object (usually from Axios).
 * @param {string} fallback - The default message to return if parsing fails.
 * @returns {string}
 */
export const getApiErrorMessage = (error, fallback = 'An unexpected error occurred.') => {
  const data = error?.response?.data;

  if (!data) return fallback;
  if (typeof data === 'string') return data;

  // Helper to extract the first element if it's an array
  const extract = (val) => (Array.isArray(val) ? val[0] : val);

  // Check common general error keys from DRF or custom backend payloads
  const generalError =
    extract(data.detail) ||
    extract(data.error) ||
    extract(data.message) ||
    extract(data.non_field_errors);

  if (generalError && typeof generalError === 'string') {
    return generalError;
  }

  // If no general error, find the first string value from field-specific errors
  for (const key in data) {
    const val = extract(data[key]);
    if (typeof val === 'string') {
      return val; // e.g., returns "This field is required." for phone_number
    }
  }

  return fallback;
};
