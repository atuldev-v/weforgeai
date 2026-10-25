import axios from 'axios';

const SESSION_TOKEN_KEY = 'webforge_session_token';
const apiBaseURL = import.meta.env.VITE_API_URL || '/api';
const apiIsCrossOrigin =
  typeof window !== 'undefined' && new URL(apiBaseURL, window.location.origin).origin !== window.location.origin;

export function saveSessionToken(token) {
  if (!apiIsCrossOrigin) return;

  try {
    if (token) sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    else sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Same-origin requests can still authenticate with the httpOnly cookie.
  }
}

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!apiIsCrossOrigin) return config;

  try {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Cookie authentication may still work if the API is same-site.
  }
  return config;
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
