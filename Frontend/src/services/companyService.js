import api from './api';

export const listCompanies = () => {
  return api.get('/companies');
};

export const addCompany = (companyData) => {
  return api.post('/companies', companyData);
};

export const updateCompany = (id, companyData) => {
  return api.put(`/companies/${id}`, companyData);
};

export const deleteCompany = (id) => {
  return api.delete(`/companies/${id}`);
};
