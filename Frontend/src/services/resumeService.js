import api from './api';

// Upload a resume (multipart FormData with 'resume' field)
export const uploadResume = (formData) => {
  return api.post('/student/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Get all resumes for current student
export const getAllResumes = () => {
  return api.get('/student/resume/all');
};

// Get active resume status
export const getResumeStatus = () => {
  return api.get('/student/resume/status');
};

// Get full detail of a specific resume
export const getResumeDetail = (resumeId) => {
  return api.get(`/student/resume/${resumeId}`);
};

// Set a specific resume as active
export const activateResume = (resumeId) => {
  return api.put(`/student/resume/${resumeId}/activate`);
};
