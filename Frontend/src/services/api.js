import axios from 'axios';
const token = localStorage.getItem("auth");

// create instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// attach token automatically
api.interceptors.request.use(
  (config) => {
    try {
      const stored = JSON.parse(localStorage.getItem('auth'));
      if (stored && stored.token) {
        config.headers.Authorization = `Bearer ${stored.token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
