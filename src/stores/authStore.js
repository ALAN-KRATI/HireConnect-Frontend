import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            // Simulate API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const data = await response.json();
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error.message,
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },

        clearError: () => {
          set({ error: null });
        },

        setUser: (user) => {
          set({ user, isAuthenticated: !!user });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

export default useAuthStore;