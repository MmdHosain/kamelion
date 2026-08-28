import { create } from 'zustand';
import { settingsService } from '../api/settingsService';

export const THEMES = {
  pink: {
    id: 'pink',
    name: 'صورتی (پیش‌فرض)',
    primary: '#e75480',
    primaryDark: '#ba2d63',
    bgLight: '#f7d6e4',
    bgDark: '#e4d1f0',
    textDark: '#4a2545',
  },
  lilac: {
    id: 'lilac',
    name: 'یاسی و بنفش روشن',
    primary: '#b685c2',
    primaryDark: '#7d4a99',
    bgLight: '#e4d1f0',
    bgDark: '#f0d1e4',
    textDark: '#4a2545',
  },
  purple: {
    id: 'purple',
    name: 'ارغوانی لوکس',
    primary: '#7d4a99',
    primaryDark: '#e75480',
    bgLight: '#ebd4f5',
    bgDark: '#f7d6e4',
    textDark: '#4a2545',
  },
};

const getInitialTheme = () => {
  const saved = localStorage.getItem('site_theme');
  return saved && THEMES[saved] ? saved : 'pink';
};

export const applyThemeToDom = (themeKey) => {
  const theme = THEMES[themeKey] || THEMES.pink;
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-dark', theme.primaryDark);
  root.style.setProperty('--bg-light', theme.bgLight);
  root.style.setProperty('--bg-dark', theme.bgDark);
  root.style.setProperty('--text-dark', theme.textDark);
};

export const useThemeStore = create((set, get) => ({
  activeTheme: getInitialTheme(),
  isLoading: false,

  fetchTheme: async () => {
    try {
      const serverTheme = await settingsService.getTheme();
      if (serverTheme && THEMES[serverTheme]) {
        localStorage.setItem('site_theme', serverTheme);
        applyThemeToDom(serverTheme);
        set({ activeTheme: serverTheme });
        return serverTheme;
      }
    } catch {
      // Keep local fallback
    }
    return get().activeTheme;
  },

  setTheme: (themeKey) => {
    if (THEMES[themeKey]) {
      localStorage.setItem('site_theme', themeKey);
      applyThemeToDom(themeKey);
      set({ activeTheme: themeKey });
    }
  },

  saveTheme: async (themeKey) => {
    if (!THEMES[themeKey]) return false;
    set({ isLoading: true });
    // Apply optimistically locally
    localStorage.setItem('site_theme', themeKey);
    applyThemeToDom(themeKey);
    set({ activeTheme: themeKey });

    try {
      await settingsService.saveTheme(themeKey);
      set({ isLoading: false });
      return true;
    } catch {
      // Backend may be offline or returned error; local state remains applied
      set({ isLoading: false });
      return false;
    }
  },
}));
