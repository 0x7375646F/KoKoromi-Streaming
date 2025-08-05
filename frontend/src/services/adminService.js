import axios from 'axios';
import {API_BACKEND_URL} from '../config/config';

    
// Create Axios instance
const adminApi = axios.create({
  baseURL: API_BACKEND_URL+'/admin',
  headers: {
    'Accept': '*/*',
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject Authorization header
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/admin'; // Redirect if unauthorized
    }
    return Promise.reject(error);
  }
);

// 📊 Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await adminApi.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

// 👥 User Management
export const getUsers = async (params = {}) => {
  try {
    const response = await adminApi.get('/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await adminApi.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

export const manageUser = async (userId, action, reason = null) => {
  try {
    // Only include reason in the request if it's provided and not empty
    const requestData = {
      userId,
      action,
      ...(reason && reason.trim() && { reason })
    };
    
    const response = await adminApi.post('/users/manage', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Failed to ${action} user`);
  }
};

// 🔍 API Statuses
export const getApiStatuses = async (category = '') => {
  try {
    const params = category ? { category } : {};
    const response = await adminApi.get('/api-status', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch API statuses');
  }
};

export const addApiStatus = async (apiData) => {
  try {
    const response = await adminApi.post('/api-status', apiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add API status');
  }
};

export const updateApiStatus = async (apiId, apiData) => {
  try {
    const response = await adminApi.put(`/api-status/${apiId}`, apiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update API status');
  }
};

export const deleteApiStatus = async (apiId) => {
  try {
    const response = await adminApi.delete(`/api-status/${apiId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete API status');
  }
};

export const checkApiStatus = async (apiId) => {
  try {
    const response = await adminApi.post(`/api-status/${apiId}/check`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check API status');
  }
};

export const getAllComments = async (params = {}) => {
  try {
    const response = await adminApi.get('/comments', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await adminApi.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};

export default adminApi;
