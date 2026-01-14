import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

// User endpoints
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Medicine endpoints
export const getMedicines = (params) => api.get('/medicines', { params });
export const getMedicine = (id) => api.get(`/medicines/${id}`);
export const createMedicine = (data) => api.post('/medicines', data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);

// Batch endpoints
export const getBatches = (params) => api.get('/batches', { params });
export const getBatch = (id) => api.get(`/batches/${id}`);
export const getBatchesByMedicine = (medicineId) => api.get(`/batches/medicine/${medicineId}`);
export const stockIn = (data) => api.post('/batches/stock-in', data);
export const stockOut = (data) => api.post('/batches/stock-out', data);

// Audit endpoints
export const getStockLogs = (params) => api.get('/audit/stock-logs', { params });
export const getStockLogsByMedicine = (medicineId) => api.get(`/audit/stock-logs/medicine/${medicineId}`);
export const getStockLogsByBatch = (batchId) => api.get(`/audit/stock-logs/batch/${batchId}`);

// Report endpoints
export const getMonthlyUsage = (params) => api.get('/reports/monthly-usage', { params });
export const getTopConsumed = (params) => api.get('/reports/top-consumed', { params });
export const getExpiredWastage = (params) => api.get('/reports/expired-wastage', { params });

// Dashboard stats endpoint (if available in backend)
export const getDashboardStats = () => api.get('/reports/dashboard-stats').catch(() => ({ data: {} }));

export default api;