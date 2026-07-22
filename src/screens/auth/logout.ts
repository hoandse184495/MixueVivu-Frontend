import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../api/api';

export const logout = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Always clear the local session if the token expired or the server is offline.
    }
  }

  await AsyncStorage.multiRemove([
    'token',
    'refreshToken',
    'user',
    'email',
    'password',
    'rememberedEmail',
    'rememberedPassword',
  ]);
};
