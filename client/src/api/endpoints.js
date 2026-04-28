/**
 * Centralized API endpoints for the application.
 * All API paths should be defined here to avoid hardcoding strings in services.
 */

export const API_BASE_URL = `${import.meta.env.VITE_API_URL}api` || 'http://localhost:5000/api';

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  ME: '/auth/me',
};

export const PROJECT_ENDPOINTS = {
  BASE: '/projects',
  BY_ID: (id) => `/projects/${id}`,
};

export const CLIENT_ENDPOINTS = {
  BASE: '/clients',
  BY_ID: (id) => `/clients/${id}`,
};

export const TASK_ENDPOINTS = {
  BASE: '/tasks',
  BY_ID: (id) => `/tasks/${id}`,
  BY_PROJECT: (projectId) => `/tasks/project/${projectId}`,
};