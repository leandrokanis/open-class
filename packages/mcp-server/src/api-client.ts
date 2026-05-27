import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { AuthManager } from './auth-manager';

export function createApiClient(baseURL: string, auth: AuthManager): AxiosInstance {
  const client = axios.create({ baseURL });

  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await auth.getToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        auth.invalidateToken();
        const token = await auth.getToken();
        error.config.headers['Authorization'] = `Bearer ${token}`;
        return client.request(error.config);
      }
      return Promise.reject(error);
    },
  );

  return client;
}
