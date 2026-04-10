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

export const ticketService = {
  // Get all tickets with filters
  async getTickets(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/tickets?${params.toString()}`);
    return response.data;
  },

  // Get single ticket
  async getTicket(ticketId) {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data.ticket;
  },

  // Create new ticket
  async createTicket(ticketData) {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  async updateTicket(ticketId, updates) {
    const response = await api.put(`/tickets/${ticketId}`, updates);
    return response.data;
  },

  // Add comment to ticket
  async addComment(ticketId, content) {
    const response = await api.post(`/tickets/${ticketId}/comments`, { content });
    return response.data;
  },

  // Get ticket statistics
  async getTicketStats() {
    // This would be implemented on the backend
    // For now, we'll calculate from the tickets list
    const response = await api.get('/tickets');
    const tickets = response.data.tickets;
    
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      highPriority: tickets.filter(t => t.priority === 'high').length,
      mediumPriority: tickets.filter(t => t.priority === 'medium').length,
      lowPriority: tickets.filter(t => t.priority === 'low').length,
    };

    return stats;
  }
}; 