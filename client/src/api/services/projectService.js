import BaseService from './BaseService';
import { PROJECT_ENDPOINTS } from '../endpoints';
import axiosInstance from '../axiosInstance';

/**
 * Service for project-related requests.
 * Inherits standard CRUD from BaseService and adds custom methods.
 */
class ProjectService extends BaseService {
  constructor() {
    super(PROJECT_ENDPOINTS.BASE);
  }

  /**
   * Example of a custom method: Get project statistics
   */
  async getStats(projectId) {
    const response = await axiosInstance.get(`${PROJECT_ENDPOINTS.BY_ID(projectId)}/stats`);
    return response.data;
  }
}

export default new ProjectService();
