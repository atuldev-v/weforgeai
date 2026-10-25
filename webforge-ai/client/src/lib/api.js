import axios from 'axios';

const SESSION_TOKEN_KEY = 'webforge_session_token';
const apiBaseURL = import.meta.env.VITE_API_URL || '/api';
const apiNotConfigured = import.meta.env.BASE_URL.startsWith('/weforgeai/') && !import.meta.env.VITE_API_URL;
const apiConfigurationMessage =
  'The backend API is not configured for this deployment. Deploy the Express API, set the GitHub Actions variable VITE_API_URL to its /api URL, then redeploy the site.';
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
  if (apiNotConfigured) return Promise.reject(new Error(apiConfigurationMessage));
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
    const message = error.message === apiConfigurationMessage
      ? apiConfigurationMessage
      : error.response?.data?.message ||
        (error.response?.status === 404
          ? 'The API endpoint was not found. Confirm VITE_API_URL ends in /api.'
          : !error.response
            ? 'Cannot reach the API server. Check that it is deployed and reachable.'
            : 'Something went wrong. Please try again.');
    const details = error.response?.data?.details;
    const normalized = new Error(message);
    normalized.details = details;
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);
