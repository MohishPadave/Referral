import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; email: string; referralCode: string; credits: number };
type Stats = { totalReferred: number; convertedCount: number; totalCredits: number; referralLink: string };

type State = {
  user: User | null;
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  setUser: (u: User | null) => void;
  setStats: (s: Stats | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  toggleDark: () => void;
  initializeDarkMode: () => void;
};

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      stats: null,
      loading: false,
      error: null,
      darkMode: false,
      setUser: (u) => set({ user: u }),
      setStats: (s) => set({ stats: s }),
      setLoading: (v) => set({ loading: v }),
      setError: (e) => set({ error: e }),
      toggleDark: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
        
        // Update document class for immediate effect
        if (typeof window !== 'undefined') {
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      initializeDarkMode: () => {
        if (typeof window !== 'undefined') {
          const { darkMode } = get();
          if (darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: 'referral-hub-storage',
      partialize: (state) => ({ 
        user: state.user, 
        darkMode: state.darkMode 
      }),
    }
  )
);


