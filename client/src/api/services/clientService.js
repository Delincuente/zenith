import BaseService from './BaseService';
import { CLIENT_ENDPOINTS } from '../endpoints';

/**
 * Service for client-related requests.
 */
class ClientService extends BaseService {
  constructor() {
    super(CLIENT_ENDPOINTS.BASE);
  }
}

export default new ClientService();
