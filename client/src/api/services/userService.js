import axiosInstance from '../axiosInstance';
import { USER_ENDPOINTS } from '../endpoints';
import BaseService from './BaseService';

class UserService extends BaseService {
  constructor() {
    super(USER_ENDPOINTS.PROFILE_UPDATE); // Base URL for this service
  }

  /**
   * Update current user profile
   * @param {Object} profileData - { name, email }
   * @returns {Promise}
   */
  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put(USER_ENDPOINTS.PROFILE_UPDATE, profileData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error updating profile');
    }
  }

  /**
   * Change current user password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise}
   */
  async changePassword(passwordData) {
    try {
      const response = await axiosInstance.put(USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error changing password');
    }
  }
}

export default new UserService();
