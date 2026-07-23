import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
const API_PORT = '5000';
const API_PATH = '/api';
const DEV_MACHINE_HOST = process.env.EXPO_PUBLIC_DEV_HOST || '192.168.100.231';
const normalizeHost = (value) => {
    if (!value)
        return undefined;
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
    var _a, _b, _c, _d, _e, _f;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.location.hostname;
    }
    const expoConstants = NativeModules.ExponentConstants;
    const hostCandidates = [
        (_a = expoConstants === null || expoConstants === void 0 ? void 0 : expoConstants.expoConfig) === null || _a === void 0 ? void 0 : _a.hostUri,
        (_d = (_c = (_b = expoConstants === null || expoConstants === void 0 ? void 0 : expoConstants.manifest2) === null || _b === void 0 ? void 0 : _b.extra) === null || _c === void 0 ? void 0 : _c.expoGo) === null || _d === void 0 ? void 0 : _d.debuggerHost,
        (_e = expoConstants === null || expoConstants === void 0 ? void 0 : expoConstants.manifest) === null || _e === void 0 ? void 0 : _e.debuggerHost,
        (_f = NativeModules.SourceCode) === null || _f === void 0 ? void 0 : _f.scriptURL,
    ];
    for (const candidate of hostCandidates) {
        const host = normalizeHost(candidate);
        if (host)
            return host;
    }
    return undefined;
};
const getApiUrl = () => {
    const manualApiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (manualApiUrl)
        return manualApiUrl;
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
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
let refreshRequest = null;
api.interceptors.response.use((response) => response, async (error) => {
    var _a, _b;
    const originalRequest = error.config;
    const isAuthRequest = (_a = originalRequest === null || originalRequest === void 0 ? void 0 : originalRequest.url) === null || _a === void 0 ? void 0 : _a.startsWith('/auth/');
    if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) !== 401 || (originalRequest === null || originalRequest === void 0 ? void 0 : originalRequest._retry) || isAuthRequest) {
        return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
        if (!refreshRequest) {
            refreshRequest = (async () => {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken)
                    throw new Error('No refresh token');
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
    }
    catch (refreshError) {
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        return Promise.reject(refreshError);
    }
});
export default api;
