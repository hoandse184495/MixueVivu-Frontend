import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.2.5:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let refreshRequest: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.startsWith('/auth/');

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = (async () => {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          const tokens = response.data.data;

          await AsyncStorage.multiSet([
            ['token', tokens.accessToken || tokens.token],
            ['refreshToken', tokens.refreshToken],
          ]);

          return tokens.accessToken || tokens.token;
        })().finally(() => {
          refreshRequest = null;
        });
      }

      const accessToken = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
