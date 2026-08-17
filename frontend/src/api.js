import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });
let refreshPromise;

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
    const original = err.config;
    if (err.response?.status === 401 && !original?._retried && !original?.url?.includes('/auth/refresh')) {
      original._retried = true;
      refreshPromise ||= api.post('/auth/refresh').finally(() => { refreshPromise = null; });
      return refreshPromise.then((response) => {
        localStorage.setItem('token', response.data.token);
        original.headers.Authorization = `Bearer ${response.data.token}`;
        return api(original);
      }).catch(() => {
        localStorage.removeItem('token'); localStorage.removeItem('user');
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(err);
      });
    }
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
export const logoutSession = () => api.post('/auth/logout');
export const logoutAllSessions = () => api.post('/auth/logout-all');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });
export const verifyEmail = (token) => api.post('/auth/verify-email', { token });
export const exportAccount = () => api.get('/auth/export', { responseType: 'blob' });
export const deleteAccount = () => api.delete('/auth/account');

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
export const generateResume = (jdId, templateId, profileVariantId) =>
  api.post(`/job-descriptions/${jdId}/generate`, { templateId, profileVariantId });
export const updateGeneratedResume = (jdId, resumeId, content) =>
  api.put(`/job-descriptions/${jdId}/resumes/${resumeId}`, { content });
export const restoreGeneratedResumeRevision = (jdId, resumeId, revisionId) =>
  api.post(`/job-descriptions/${jdId}/resumes/${resumeId}/revisions/${revisionId}/restore`);

export const getTemplates = () => api.get('/templates');
export const getPlans = () => api.get('/billing/plans');
export const getUsage = () => api.get('/billing/usage');
export const createCheckout = (planId) => api.post('/billing/checkout', { planId });
export const createBillingPortal = () => api.post('/billing/portal');
export const getProfileVariants = () => api.get('/profile-variants');
export const createProfileVariant = (data) => api.post('/profile-variants', data);
export const updateProfileVariant = (id, data) => api.put(`/profile-variants/${id}`, data);
export const deleteProfileVariant = (id) => api.delete(`/profile-variants/${id}`);
export const generateCoverLetter = (jdId, profileVariantId) =>
  api.post(`/job-descriptions/${jdId}/cover-letter`, { profileVariantId });
export const downloadResumePdf = (jdId, resumeId, options) =>
  api.get(`/job-descriptions/${jdId}/resumes/${resumeId}/pdf`, { params: options, responseType: 'blob' });
export const enqueueResumeGeneration = (jdId, templateId) => api.post(`/job-descriptions/${jdId}/generate-async`, { templateId });
export const getGenerationJob = (jobId) => api.get(`/job-descriptions/jobs/${jobId}`);

export default api;
