import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Normalizes error shape so callers can just read err.message / err.details.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const details = error.response?.data?.details;
    const normalized = new Error(message);
    normalized.details = details;
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);
