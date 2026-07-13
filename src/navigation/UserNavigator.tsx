import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import TourDetailScreen from '../screens/user/TourDetailScreen';
import BookingScreen from '../screens/user/BookingScreen';
import BookingHistoryScreen from '../screens/user/BookingHistoryScreen';
import FavoriteScreen from '../screens/user/FavoriteScreen';
import FriendScreen from '../screens/user/FriendScreen';
import ContactScreen from '../screens/user/ContactScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import SettingsScreen from '../screens/user/SettingsScreen';
import UserPaymentsScreen from '../screens/user/UserPaymentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  primary: '#0058bc',
  inactive: '#9BA5B7',
  background: '#ffffff',
  primaryLight: '#e8f0fe',
};

type TabName = 'Trang chủ' | 'Yêu thích' | 'Booking' | 'Thanh toán' | 'Bạn bè' | 'Hồ sơ';

interface TabIconProps {
  name: TabName;
  focused: boolean;
}

const TAB_ICONS: Record<TabName, { icon: string; activeIcon: string }> = {
  'Trang chủ': { icon: '🏠', activeIcon: '🏡' },
  'Yêu thích': { icon: '🤍', activeIcon: '❤️' },
  'Booking': { icon: '📋', activeIcon: '🎫' },
  'Thanh toán': { icon: '💳', activeIcon: '💸' },
  'Bạn bè': { icon: '👥', activeIcon: '🫂' },
  'Hồ sơ': { icon: '👤', activeIcon: '🙋' },
};

function TabIcon({ name, focused }: TabIconProps) {
  const icons = TAB_ICONS[name];
  return (
    <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
      <Text style={styles.tabEmoji}>
        {focused ? icons.activeIcon : icons.icon}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {name}
      </Text>
    </View>
  );
}

function HomeStack({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserHome">
        {(props) => <UserHomeScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="TourDetail" component={TourDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
    </Stack.Navigator>
  );
}

function FavoriteStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoriteList" component={FavoriteScreen} />
      <Stack.Screen name="TourDetail" component={TourDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfile">
        {(props) => <UserProfileScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
    </Stack.Navigator>
  );
}

import { useWindowDimensions } from 'react-native';
import ResponsiveTabBar from './ResponsiveTabBar';

export default function UserNavigator({ onLogout }: { onLogout: () => void }) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <ResponsiveTabBar
          {...props}
          onLogout={onLogout}
          role="user"
          primaryColor={COLORS.primary}
          primaryColorLight={COLORS.primaryLight}
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
        name="HomeTab"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Trang chủ" focused={focused} />
          ),
        }}
      >
        {() => <HomeStack onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="FavoritesTab"
        component={FavoriteStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Yêu thích" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="BookingsTab"
        component={BookingHistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Booking" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="PaymentsTab"
        component={UserPaymentsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Thanh toán" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="FriendsTab"
        component={FriendScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Bạn bè" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Hồ sơ" focused={focused} />
          ),
        }}
      >
        {() => <ProfileStack onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    minWidth: 56,
  },
  tabIconWrapperActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.inactive,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
