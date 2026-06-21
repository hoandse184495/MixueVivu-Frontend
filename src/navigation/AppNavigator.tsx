import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
