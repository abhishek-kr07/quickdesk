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

export const categoryService = {
  // Get all categories
  async getCategories() {
    const response = await api.get('/categories');
    return response.data.categories;
  },

  // Get single category
  async getCategory(categoryId) {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.category;
  },

  // Create new category (admin only)
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (admin only)
  async updateCategory(categoryId, updates) {
    const response = await api.put(`/categories/${categoryId}`, updates);
    return response.data;
  },

  // Delete category (admin only)
  async deleteCategory(categoryId) {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  }
}; 