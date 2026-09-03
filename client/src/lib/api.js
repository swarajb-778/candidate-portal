import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true // required — the session is an httpOnly cookie
});

// A 401 anywhere means the session died. Route to /session-expired rather than
// bouncing straight to /login, so the user gets the explanation screen.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.startsWith('/login')) {
      window.dispatchEvent(new CustomEvent('session:expired'));
    }
    return Promise.reject(err);
  }
);

export const apiError = (err) => err?.response?.data?.error ?? null;
