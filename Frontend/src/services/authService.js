import api from './api';

export const login = (credentials) => {
  // credentials: { email, password }
  return api.post('/auth/login', credentials);
};

export const register = (userData) => {
  // userData: { name, email, password, role }
  return api.post('/auth/register', userData);
};

export const fetchProfile = () => {
  return api.get('/auth/profile');
};
