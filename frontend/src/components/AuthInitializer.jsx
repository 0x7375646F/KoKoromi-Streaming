import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

const AuthInitializer = () => {
  const { login, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        // Initialize auth state from localStorage
        initializeAuth();

        // Only proceed if token exists
        const token = localStorage.getItem('authToken');
        if (!token) {
          logout();
          return;
        }

        // Check if user is authenticated and get profile data in one call
        const result = await authService.checkAuth();

        if (result.success) {
          // User is authenticated, update user data with the response
          login(result.data, null);
        } else {
          // User is not authenticated, ensure logout state
          logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // On error, assume not authenticated
        logout();
      }
    };

    initializeAuthState();
  }, [login, logout, initializeAuth]);

  // This component doesn't render anything
  return null;
};

export default AuthInitializer; 