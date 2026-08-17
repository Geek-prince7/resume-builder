import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const googleAuth = (credential) => api.post('/auth/google', { credential });
export const getMe = () => api.get('/auth/me');

export const getUser = () => api.get('/users/profile');
export const updateUser = (data) => api.put('/users/profile', data);
export const parseResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/users/profile/parse-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createJobDescription = (data) => api.post('/job-descriptions', data);
export const getJobDescriptions = () => api.get('/job-descriptions');
export const getJobDescription = (jdId) => api.get(`/job-descriptions/${jdId}`);
export const generateResume = (jdId, templateId) =>
  api.post(`/job-descriptions/${jdId}/generate`, { templateId });
export const updateGeneratedResume = (jdId, resumeId, content) =>
  api.put(`/job-descriptions/${jdId}/resumes/${resumeId}`, { content });
export const restoreGeneratedResumeRevision = (jdId, resumeId, revisionId) =>
  api.post(`/job-descriptions/${jdId}/resumes/${resumeId}/revisions/${revisionId}/restore`);

export const getTemplates = () => api.get('/templates');

export default api;
