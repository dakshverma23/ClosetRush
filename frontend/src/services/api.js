import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Only log unexpected errors (not 404s which are often expected)
      if (status !== 404 && status !== 401) {
        console.error('API Error:', status, error.config?.url);
      }

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject({
        error: {
          code: status === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR',
          message: data?.message || data?.error?.message || `Server error: ${status}`,
          status: status,
          details: data
        },
        response: error.response
      });
    } else if (error.request) {
      console.error('Network error - no response received. Is the backend running on port 5000?');
      return Promise.reject({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Cannot connect to server. Please check if the backend is running on port 5000.'
        }
      });
    } else {
      console.error('Request setup error:', error.message);
      return Promise.reject({
        error: {
          code: 'REQUEST_ERROR',
          message: error.message || 'An unexpected error occurred'
        }
      });
    }
  }
);

export default api;
