import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://one8-2hko.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRoute
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = api
        .post('/auth/refresh')
        .then((res) => {
          const { accessToken, user } = res.data;
          localStorage.setItem('accessToken', accessToken);
          if (user) {
            localStorage.setItem('one8_user', JSON.stringify(user));
          }
          return accessToken;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('one8_user');
      return Promise.reject(refreshError);
    }
  }
);

export default api;
