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
    console.log('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Return structured error response
      return Promise.reject({
        error: {
          code: status === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR',
          message: data?.message || `Server error: ${status}`,
          status: status,
          details: data
        }
      });
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error - no response:', error.request);
      return Promise.reject({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Cannot connect to server. Please check if the backend is running on port 5000.'
        }
      });
    } else {
      // Something else happened
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
