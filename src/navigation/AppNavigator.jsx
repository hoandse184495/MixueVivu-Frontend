import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { logout } from '../screens/auth/logout';
import { authService } from '../services';
import UserNavigator from './UserNavigator';
import ProviderNavigator from './ProviderNavigator';
import ManagerNavigator from './ManagerNavigator';
const Stack = createNativeStackNavigator();
export default function AppNavigator() {
    const [user, setUser] = useState(null);
    const [checkingLogin, setCheckingLogin] = useState(true);
    const checkLogin = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await authService.getProfile();
                const freshUser = response.data.data;
                await AsyncStorage.setItem('user', JSON.stringify(freshUser));
                setUser(freshUser);
            }
            else {
                await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
                setUser(null);
            }
        }
        catch (_a) {
            await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
            setUser(null);
        }
        finally {
            setCheckingLogin(false);
        }
    };
    const handleLoginSuccess = async () => {
        const userStorage = await AsyncStorage.getItem('user');
        if (userStorage)
            setUser(JSON.parse(userStorage));
    };
    const handleLogout = async () => {
        await logout();
        setUser(null);
    };
    const renderNavigatorByRole = (role) => {
        if (role === 'provider' && (user === null || user === void 0 ? void 0 : user.providerStatus) !== 'approved') {
            return (<View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f7f9fb' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#191c1e', marginBottom: 8 }}>
            {(user === null || user === void 0 ? void 0 : user.providerStatus) === 'rejected' ? 'Tài khoản chưa được duyệt' : 'Đang chờ quản lý duyệt'}
          </Text>
          <Text style={{ fontSize: 14, color: '#717786', lineHeight: 21, marginBottom: 20 }}>
            {(user === null || user === void 0 ? void 0 : user.providerStatus) === 'rejected'
                    ? (user === null || user === void 0 ? void 0 : user.providerRejectReason) || 'Thông tin công ty chưa đạt yêu cầu. Vui lòng liên hệ quản lý để cập nhật.'
                    : 'Bạn đã đăng ký tài khoản công ty du lịch. Sau khi manager duyệt, bạn có thể đăng tour và quản lý booking.'}
          </Text>
          <TouchableOpacity style={{ height: 48, borderRadius: 14, backgroundColor: '#0058bc', alignItems: 'center', justifyContent: 'center' }} onPress={handleLogout}>
            <Text style={{ color: '#ffffff', fontWeight: '800' }}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>);
        }
        if (role === 'provider')
            return <ProviderNavigator onLogout={handleLogout}/>;
        if (role === 'manager')
            return <ManagerNavigator onLogout={handleLogout}/>;
        return <UserNavigator onLogout={handleLogout}/>;
    };
    useEffect(() => {
        checkLogin();
    }, []);
    if (checkingLogin) {
        return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f9fb' }}>
        <ActivityIndicator size="large" color="#0058bc"/>
      </View>);
    }
    return (<NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (<Stack.Screen name="Main">
            {() => renderNavigatorByRole(user.role)}
          </Stack.Screen>) : (<>
            <Stack.Screen name="Login">
              {(props) => (<LoginScreen {...props} onLoginSuccess={handleLoginSuccess}/>)}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen}/>
          </>)}
      </Stack.Navigator>
    </NavigationContainer>);
}
