import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../api';

/**
 * Authentication Store using Zustand
 * Handles global user state, loading status, and authentication actions.
 * Persists data to localStorage automatically.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await authService.login({ email, password });
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const data = await authService.register(userData);
          set({ 
            user: data.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          // Also clear localStorage completely if needed
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const data = await authService.getCurrentUser();
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          localStorage.removeItem('accessToken');
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // only persist these fields
    }
  )
);

export default useAuthStore;
