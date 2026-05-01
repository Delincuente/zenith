import axiosInstance from '../axiosInstance';
import { BILLING_ENDPOINTS } from '../endpoints';

/**
 * Service for billing and subscription related requests.
 */
class BillingService {
  /**
   * Creates a Stripe checkout session for a specific plan and billing cycle.
   * @param {string} planId - The ID of the plan ('pro', 'team', etc.)
   * @param {string} interval - The billing cycle ('monthly', 'yearly')
   */
  async createCheckoutSession(planId, interval, config = {}) {
    const response = await axiosInstance.post(BILLING_ENDPOINTS.CREATE_CHECKOUT, {
      plan: planId,
      interval: interval
    }, config);
    return response.data;
  }
}

export default new BillingService();
