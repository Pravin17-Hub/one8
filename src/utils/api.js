import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || 'https://one8-2hko.onrender.com/api';
if (apiURL && !apiURL.endsWith('/api') && !apiURL.endsWith('/api/')) {
  apiURL = apiURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;