import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const API_PORT = '5000';
const API_PATH = '/api';
const DEV_MACHINE_HOST = process.env.EXPO_PUBLIC_DEV_HOST || '192.168.100.231';

const normalizeHost = (value?: string | null) => {
  if (!value) return undefined;

  const host = value
    .replace(/^https?:\/\//, '')
    .replace(/^exp:\/\//, '')
    .split('/')[0]
    .split(':')[0];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return undefined;
  }

  return host;
};

const getDevServerHost = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname;
  }

  const expoConstants = NativeModules.ExponentConstants;
  const hostCandidates = [
    expoConstants?.expoConfig?.hostUri,
    expoConstants?.manifest2?.extra?.expoGo?.debuggerHost,
    expoConstants?.manifest?.debuggerHost,
    NativeModules.SourceCode?.scriptURL,
  ];

  for (const candidate of hostCandidates) {
    const host = normalizeHost(candidate);
    if (host) return host;
  }

  return undefined;
};

const getApiUrl = () => {
  const manualApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (manualApiUrl) return manualApiUrl;

  const host = getDevServerHost();

  if (host) {
    return `http://${host}:${API_PORT}${API_PATH}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}${API_PATH}`;
  }

  return `http://${DEV_MACHINE_HOST}:${API_PORT}${API_PATH}`;
};

export const API_URL = getApiUrl();

if (__DEV__) {
  console.log('MixueVivu API URL:', API_URL);
}

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
