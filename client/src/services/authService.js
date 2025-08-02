import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  async login(email, password) {
    console.log('authService: Making login request to:', `${API_BASE_URL}/auth/login`);
    console.log('authService: Request data:', { email, password: '***' });
    
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('authService: Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('authService: Login error:', error);
      console.error('authService: Error response:', error.response?.data);
      throw error;
    }
  },

  // Register user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Update user profile
  async updateProfile(userData) {
    const response = await api.put(`/users/${userData.id}`, userData);
    return response.data;
  },

  // Get all users (admin only)
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data.users;
  },

  // Update user (admin only)
  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Get user statistics (admin only)
  async getUserStats() {
    const response = await api.get('/users/stats/overview');
    return response.data.stats;
  },

  // Change password
  async changePassword(passwordData) {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },



  // Delete user (admin only)
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
}; 