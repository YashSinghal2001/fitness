import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
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
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const registerAdmin = async (userData: any) => {
  const response = await api.post('/auth/admin/register', userData);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (userData: any) => {
  const response = await api.post('/auth/login', userData);
  if (response.data) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.user.role);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

export default api;
