import axiosInstance from '../axiosInstance';

/**
 * BaseService provides common methods for all services.
 * It encapsulates common API patterns and reduces boilerplate.
 */
class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Fetch all items
   */
  async getAll(params = {}) {
    const response = await axiosInstance.get(this.endpoint, { params });
    return response.data;
  }

  /**
   * Fetch a single item by ID
   */
  async getById(id) {
    const response = await axiosInstance.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Create a new item
   */
  async create(data) {
    const response = await axiosInstance.post(this.endpoint, data);
    return response.data;
  }

  /**
   * Update an existing item
   */
  async update(id, data) {
    const response = await axiosInstance.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Delete an item
   */
  async delete(id) {
    const response = await axiosInstance.delete(`${this.endpoint}/${id}`);
    return response.data;
  }
}

export default BaseService;
