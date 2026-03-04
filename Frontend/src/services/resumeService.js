import api from './api';

export const uploadResume = (formData) => {
  // formData should be FormData containing file
  return api.post('/resume/upload', formData);
};

export const getResumeStatus = () => {
  return api.get('/resume/status');
};
