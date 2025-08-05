import {API_BACKEND_URL} from "../config/config";


// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Verify OTP
  verifyOTP: async (username, otp) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, otp }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'OTP verification failed' };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Reset password
  resetPassword: async (username, newPassword, otp) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/auth/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, newPassword, otp }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Password reset failed' };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Logout failed' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/users/me`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Authentication check failed' };
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/users/me`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Failed to get profile' };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Update username
  updateUsername: async (newUsername) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/users/username`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Failed to update username' };
      }
    } catch (error) {
      console.error('Update username error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BACKEND_URL}/users/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Failed to update password' };
      }
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
        const response = await fetch(`${API_BACKEND_URL}/users/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Failed to delete account' };
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, message: 'Network error' };
    }
  },
};

export default authService; 