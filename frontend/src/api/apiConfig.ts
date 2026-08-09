import { Configuration } from '@/sdk';
import { storage } from '@/lib/storage';

export const apiConfig = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  accessToken: () => storage.getToken() ?? '',
});
