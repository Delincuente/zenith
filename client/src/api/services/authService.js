import axiosInstance from '../axiosInstance';
import { AUTH_ENDPOINTS } from '../endpoints';

/**
 * Service for authentication-related requests.
 */
const authService = {
  /**
   * Log in a user
   */
  login: async (credentials) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    } finally {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  },

  /**
   * Get the current user profile
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Refresh the access token
   */
  refreshToken: async () => {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },
};

export default authService;
