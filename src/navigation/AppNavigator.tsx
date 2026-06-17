import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
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
    } catch (error) {
      setUser(null);
    } finally {
      setCheckingLogin(false);
    }
  };

  const handleLoginSuccess = async () => {
    const userStorage = await AsyncStorage.getItem('user');

    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const renderHomeByRole = (role: UserRole) => {
    if (role === 'provider') {
      return <ProviderDashboardScreen onLogout={handleLogout} />;
    }

    if (role === 'manager') {
      return <ManagerDashboardScreen onLogout={handleLogout} />;
    }

    return <UserHomeScreen onLogout={handleLogout} />;
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (checkingLogin) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => renderHomeByRole(user.role)}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}