import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      authModalOpen: false,
      otpModalOpen: false,
      authStep: 'info', // 'info' | 'otp' | 'success'
      tempAuthData: null, // Store phone/name during OTP flow

      // Actions
      setTokens: (accessToken, refreshToken) => {
        set({ 
          accessToken, 
          refreshToken,
          isAuthenticated: !!accessToken 
        });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      login: (userData, tokens) => {
        set({
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          authModalOpen: false,
          otpModalOpen: false,
          authStep: 'success',
          tempAuthData: null,
        });
      },

      logout: async () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          authModalOpen: false,
          otpModalOpen: false,
          authStep: 'info',
          tempAuthData: null,
        });
        localStorage.removeItem('auth-storage');
        sessionStorage.removeItem('auth');
      },

      // Modal control
      openAuthModal: () => set({ authModalOpen: true, authStep: 'info' }),
      closeAuthModal: () => set({ authModalOpen: false, authStep: 'info', tempAuthData: null }),
      
      setOtpModalOpen: (open) => set({ otpModalOpen: open }),
      setAuthStep: (step) => set({ authStep: step }),
      setTempAuthData: (data) => set({ tempAuthData: data }),

      // Getters
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      getUser: () => get().user,
      isAdmin: () => get().user?.role === 'admin',
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
