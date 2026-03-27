import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const createUser = (data) => api.post('/users', data);
export const getUser = (userId) => api.get(`/users/${userId}`);
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);

export const parseResume = (userId, file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post(`/users/${userId}/parse-resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createJobDescription = (userId, data) =>
  api.post(`/users/${userId}/job-descriptions`, data);

export const getJobDescriptions = (userId) =>
  api.get(`/users/${userId}/job-descriptions`);

export const getJobDescription = (userId, jdId) =>
  api.get(`/users/${userId}/job-descriptions/${jdId}`);

export const generateResume = (userId, jdId, templateId) =>
  api.post(`/users/${userId}/job-descriptions/${jdId}/generate`, { templateId });

export const getTemplates = () => api.get('/templates');

export default api;
