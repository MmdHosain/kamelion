import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      authModalOpen: false,
      otpModalOpen: false,
      authStep: 'phone',
      tempAuthData: null,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      getAccessToken: () => get().accessToken,

      getRefreshToken: () => get().refreshToken,

      login: (user, tokens) => set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authModalOpen: false,
        otpModalOpen: false,
        authStep: 'phone',
        tempAuthData: null,
      }),

      openAuthModal: () => set({ authModalOpen: true, authStep: 'phone' }),

      closeAuthModal: () => set({
        authModalOpen: false,
        authStep: 'phone',
        otpModalOpen: false,
        tempAuthData: null,
      }),

      setAuthStep: (step) => set({ authStep: step }),

      setOtpModalOpen: (open) => set({ otpModalOpen: open }),

      setTempAuthData: (data) => set({ tempAuthData: data }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
