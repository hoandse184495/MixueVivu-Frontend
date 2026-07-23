import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import ProviderMyToursScreen from '../screens/provider/ProviderMyToursScreen';
import ProviderAddTourScreen from '../screens/provider/ProviderAddTourScreen';
import ProviderBookingsScreen from '../screens/provider/ProviderBookingsScreen';
import ProviderPayoutsScreen from '../screens/provider/ProviderPayoutsScreen';
import ProviderNotificationsScreen from '../screens/provider/ProviderNotificationsScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const COLORS = {
    primary: '#006c4b',
    inactive: '#9BA5B7',
    background: '#ffffff',
};
function TabIcon({ name, focused }) {
    const icons = {
        Dashboard: '📊',
        'My Tours': '🗺️',
        'Add Tour': '➕',
        Bookings: '🎫',
        Payouts: '💰',
        Notifications: '🔔',
    };
    return (<View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icons[name] || '●'}</Text>
      <Text style={{
            fontSize: 10,
            color: focused ? COLORS.primary : COLORS.inactive,
            fontWeight: focused ? '700' : '400',
            marginTop: 2,
        }}>
        {name}
      </Text>
    </View>);
}
function DashboardStack({ onLogout }) {
    return (<Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderDashboard">
        {(props) => <ProviderDashboardScreen {...props} onLogout={onLogout}/>}
      </Stack.Screen>
    </Stack.Navigator>);
}
function MyToursStack() {
    return (<Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderMyTours" component={ProviderMyToursScreen}/>
    </Stack.Navigator>);
}
import { useWindowDimensions } from 'react-native';
import ResponsiveTabBar from './ResponsiveTabBar';
export default function ProviderNavigator({ onLogout, }) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    return (<Tab.Navigator tabBar={(props) => (<ResponsiveTabBar {...props} onLogout={onLogout} role="provider" primaryColor={COLORS.primary} primaryColorLight="#e6f4ea"/>)} screenOptions={{
            headerShown: false,
            sceneStyle: {
                marginLeft: isLargeScreen ? 260 : 0,
            },
        }}>
      <Tab.Screen name="DashboardTab" options={{
            tabBarIcon: ({ focused }) => (<TabIcon name="Dashboard" focused={focused}/>),
        }}>
        {() => <DashboardStack onLogout={onLogout}/>}
      </Tab.Screen>

      <Tab.Screen name="MyToursTab" component={MyToursStack} options={{
            tabBarIcon: ({ focused }) => (<TabIcon name="My Tours" focused={focused}/>),
        }}/>

      <Tab.Screen name="AddTourTab" component={ProviderAddTourScreen} options={{
            tabBarIcon: ({ focused }) => (<TabIcon name="Add Tour" focused={focused}/>),
        }}/>

      <Tab.Screen name="ProviderBookingsTab" component={ProviderBookingsScreen} options={{
            tabBarIcon: ({ focused }) => (<TabIcon name="Bookings" focused={focused}/>),
        }}/>
      <Tab.Screen name="ProviderPayoutsTab" component={ProviderPayoutsScreen} options={{
            tabBarIcon: ({ focused }) => (<TabIcon name="Payouts" focused={focused}/>),
        }}/>
      <Tab.Screen name="ProviderNotificationsTab" component={ProviderNotificationsScreen} options={{
            tabBarIcon: ({ focused }) => (<TabIcon name="Notifications" focused={focused}/>),
        }}/>
    </Tab.Navigator>);
}
