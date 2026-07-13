import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ManagerPendingToursScreen from '../screens/manager/ManagerPendingToursScreen';
import ManagerBookingsScreen from '../screens/manager/ManagerBookingsScreen';
import ManagerUsersScreen from '../screens/manager/ManagerUsersScreen';
import ManagerPaymentsScreen from '../screens/manager/ManagerPaymentsScreen';
import ManagerPayoutsScreen from '../screens/manager/ManagerPayoutsScreen';
import ManagerCategoriesScreen from '../screens/manager/ManagerCategoriesScreen';
import ManagerContactsScreen from '../screens/manager/ManagerContactsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  primary: '#0058bc',
  inactive: '#9BA5B7',
  background: '#ffffff',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏛️',
    'Pending Tours': '⏳',
    Bookings: '🎫',
    Users: '👥',
    Payments: '💳',
    Payouts: '💰',
    Categories: '🏷️',
    Contacts: '📩',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>{icons[name] || '●'}</Text>
      <Text
        style={{
          fontSize: 9,
          color: focused ? COLORS.primary : COLORS.inactive,
          fontWeight: focused ? '700' : '400',
          marginTop: 2,
        }}
      >
        {name}
      </Text>
    </View>
  );
}

function DashboardStack({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagerDashboard">
        {(props) => <ManagerDashboardScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

import { useWindowDimensions } from 'react-native';
import ResponsiveTabBar from './ResponsiveTabBar';

export default function ManagerNavigator({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <ResponsiveTabBar
          {...props}
          onLogout={onLogout}
          role="manager"
          primaryColor={COLORS.primary}
          primaryColorLight="#e8f0fe"
        />
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          marginLeft: isLargeScreen ? 260 : 0,
        },
      }}
    >
      <Tab.Screen
        name="ManagerDashboardTab"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Dashboard" focused={focused} />
          ),
        }}
      >
        {() => <DashboardStack onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="PendingToursTab"
        component={ManagerPendingToursScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Pending Tours" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="ManagerBookingsTab"
        component={ManagerBookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Bookings" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="UsersTab"
        component={ManagerUsersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Users" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="PaymentsTab"
        component={ManagerPaymentsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Payments" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="PayoutsTab"
        component={ManagerPayoutsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Payouts" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={ManagerCategoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Categories" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="ContactsTab"
        component={ManagerContactsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Contacts" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
