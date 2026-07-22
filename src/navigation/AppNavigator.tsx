import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { logout } from '../screens/auth/logout';

import UserNavigator from './UserNavigator';
import ProviderNavigator from './ProviderNavigator';
import ManagerNavigator from './ManagerNavigator';

import { User, UserRole } from '../types';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStorage = await AsyncStorage.getItem('user');
      if (token && userStorage) {
        setUser(JSON.parse(userStorage));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setCheckingLogin(false);
    }
  };

  const handleLoginSuccess = async () => {
    const userStorage = await AsyncStorage.getItem('user');
    if (userStorage) setUser(JSON.parse(userStorage));
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const renderNavigatorByRole = (role: UserRole) => {
    if (role === 'provider' && user?.providerStatus !== 'approved') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f7f9fb' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#191c1e', marginBottom: 8 }}>
            {user?.providerStatus === 'rejected' ? 'Tài khoản chưa được duyệt' : 'Đang chờ quản lý duyệt'}
          </Text>
          <Text style={{ fontSize: 14, color: '#717786', lineHeight: 21, marginBottom: 20 }}>
            {user?.providerStatus === 'rejected'
              ? user?.providerRejectReason || 'Thông tin công ty chưa đạt yêu cầu. Vui lòng liên hệ quản lý để cập nhật.'
              : 'Bạn đã đăng ký tài khoản công ty du lịch. Sau khi manager duyệt, bạn có thể đăng tour và quản lý booking.'}
          </Text>
          <TouchableOpacity
            style={{ height: 48, borderRadius: 14, backgroundColor: '#0058bc', alignItems: 'center', justifyContent: 'center' }}
            onPress={handleLogout}
          >
            <Text style={{ color: '#ffffff', fontWeight: '800' }}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (role === 'provider')
      return <ProviderNavigator onLogout={handleLogout} />;
    if (role === 'manager')
      return <ManagerNavigator onLogout={handleLogout} />;
    return <UserNavigator onLogout={handleLogout} />;
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (checkingLogin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f9fb' }}>
        <ActivityIndicator size="large" color="#0058bc" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => renderNavigatorByRole(user.role)}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
