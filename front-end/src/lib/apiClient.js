import axios from 'axios';
import useAuthStore from '../store/authStore';

const envUrl = import.meta.env.VITE_API_URL;

if (!envUrl) {
  console.warn("⚠️ WARNING: VITE_API_URL environment variable is missing. Falling back to /api");
}

const BASE_URL = envUrl || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAccessTokenFromStore = () => {
  const state = useAuthStore.getState();
  return typeof state.getAccessToken === 'function'
    ? state.getAccessToken()
    : state.accessToken || null;
};

const getRefreshTokenFromStore = () => {
  const state = useAuthStore.getState();
  return typeof state.getRefreshToken === 'function'
    ? state.getRefreshToken()
    : state.refreshToken || null;
};

const setTokensInStore = (accessToken, refreshToken) => {
  const state = useAuthStore.getState();

  if (typeof state.setTokens === 'function') {
    state.setTokens(accessToken, refreshToken);
    return;
  }

  if (typeof state.login === 'function') {
    state.login(state.user, { accessToken, refreshToken });
  }
};

const clearAuthInStore = () => {
  const state = useAuthStore.getState();
  if (typeof state.logout === 'function') {
    state.logout();
  }
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromStore();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

const isAuthEndpoint = (url = '') => {
  return (
    url.includes('/auth/admin/login') ||
    url.includes('/auth/request-otp') ||
    url.includes('/auth/send-otp') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/complete-registration') ||
    url.includes('/auth/refresh')
  );
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    // Never refresh/rewrite failed auth requests
    if (isAuthEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshTokenFromStore();

      if (!currentRefreshToken) {
        processQueue(error, null);
        clearAuthInStore();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const newAccessToken =
          refreshResponse.data?.accessToken || refreshResponse.data?.access || null;

        const newRefreshToken =
          refreshResponse.data?.refreshToken || refreshResponse.data?.refresh || currentRefreshToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint');
        }

        setTokensInStore(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthInStore();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
