/**
 * Central export point for all API related configurations and services.
 * Usage: import { authService, projectService } from '@/api';
 */

import axiosInstance from './axiosInstance';
import * as endpoints from './endpoints';

// Services
import authService from './services/authService';

export {
  axiosInstance,
  endpoints,
  authService,
};

// Default export axios instance for simple cases
export default axiosInstance;
