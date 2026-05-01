/**
 * Central export point for all API related configurations and services.
 * Usage: import { authService, projectService } from '@/api';
 */

import axiosInstance from './axiosInstance';
import * as endpoints from './endpoints';

// Services
import authService from './services/authService';
import projectService from './services/projectService';
import clientService from './services/clientService';
import userService from './services/userService';
import billingService from './services/billingService';

export {
  axiosInstance,
  endpoints,
  authService,
  projectService,
  clientService,
  userService,
  billingService
};

// Default export axios instance for simple cases
export default axiosInstance;
