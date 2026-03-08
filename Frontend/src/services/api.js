import axios from "axios";

// create axios instance
const api = axios.create({
  // use VITE_API_URL for flexibility in different environments
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// attach token automatically
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem("auth") || "{}");

    if (stored.token) {
      config.headers.Authorization = `Bearer ${stored.token}`;
    }
  } catch (e) {}

  return config;
});

export default api;