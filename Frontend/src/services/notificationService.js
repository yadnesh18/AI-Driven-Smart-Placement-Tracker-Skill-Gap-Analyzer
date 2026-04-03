import api from './api';

// Get notifications for the logged-in student
export const getNotifications = () => {
  return api.get('/student/notifications');
};

// Mark a notification as read
export const markAsRead = (notificationId) => {
  return api.put(`/student/notifications/${notificationId}/read`);
};

// Admin: get students by company
export const getStudentsByCompany = (companyId) => {
  return api.get(`/admin/students/by-company?companyId=${companyId}`);
};

// Admin: invite student
export const inviteStudent = (studentId, data) => {
  return api.post(`/admin/students/${studentId}/invite`, data);
};

// Admin: select student
export const selectStudent = (studentId, data) => {
  return api.post(`/admin/students/${studentId}/select`, data);
};

// Admin: reject student
export const rejectStudent = (studentId, data) => {
  return api.post(`/admin/students/${studentId}/reject`, data);
};

// Admin: get companies with applicant counts
export const getAdminCompanies = () => {
  return api.get('/admin/companies');
};
