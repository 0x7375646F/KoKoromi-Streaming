import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (userData, token) => {
    // Store token in localStorage
    if (token) {
      localStorage.setItem('authToken', token);
    }
    set({
      user: userData,
      token: token,
      isAuthenticated: true,
    });
  },
  
  logout: () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData },
  })),

  // Initialize auth state from localStorage
  initializeAuth: () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      set({
        token: token,
        isAuthenticated: true,
      });
    }
  },
}));

export default useAuthStore; 