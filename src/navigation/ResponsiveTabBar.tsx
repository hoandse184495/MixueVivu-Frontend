import { useWindowDimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { User } from '../types';

interface ResponsiveTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  onLogout: () => void;
  role: 'user' | 'provider' | 'manager';
  primaryColor: string;
  primaryColorLight: string;
}

export default function ResponsiveTabBar({
  state,
  descriptors,
  navigation,
  onLogout,
  role,
  primaryColor,
  primaryColorLight,
}: ResponsiveTabBarProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    fetchUser();
  }, []);

  const getEmojiIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('home') || lower.includes('dashboard')) return '🏛️';
    if (lower.includes('pending') || lower.includes('mytours')) return '🗺️';
    if (lower.includes('bookings') || lower.includes('booking')) return '🎫';
    if (lower.includes('guides')) return '🧭';
    if (lower.includes('contacts')) return '📩';
    if (lower.includes('profile')) return '👤';
    if (lower.includes('favorites')) return '❤️';
    if (lower.includes('friends')) return '👥';
    if (lower.includes('add')) return '➕';
    return '●';
  };

  const getLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('home') || lower.includes('dashboard')) return 'Dashboard';
    if (lower.includes('pending')) return 'Duyệt Tour';
    if (lower.includes('mytours')) return 'Tours Của Tôi';
    if (lower.includes('bookings')) return 'Đơn Đặt Tour';
    if (lower.includes('guides')) return 'H.Dẫn Viên';
    if (lower.includes('contacts')) return 'Hỗ Trợ';
    if (lower.includes('profile')) return 'Tài Khoản';
    if (lower.includes('favorites')) return 'Yêu Thích';
    if (lower.includes('friends')) return 'Bạn Bè';
    if (lower.includes('add')) return 'Thêm Tour';
    return name;
  };

  if (isLargeScreen) {
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={[styles.logoText, { color: primaryColor }]}>MixueVivu</Text>
          <View style={[styles.roleBadge, { backgroundColor: primaryColorLight }]}>
            <Text style={[styles.roleBadgeText, { color: primaryColor }]}>
              {role === 'manager' ? 'Admin' : role === 'provider' ? 'Đối tác' : 'Thành viên'}
            </Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                  styles.sidebarMenuItem,
                  isFocused && { backgroundColor: primaryColorLight },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.menuIcon}>{getEmojiIcon(route.name)}</Text>
                <Text
                  style={[
                    styles.menuLabel,
                    isFocused && { color: primaryColor, fontWeight: '700' },
                  ]}
                >
                  {getLabel(route.name)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: primaryColorLight }]}>
              <Text style={[styles.avatarText, { color: primaryColor }]}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userFullName} numberOfLines={1}>
                {user?.fullName || 'Người dùng'}
              </Text>
              <Text style={styles.userRole} numberOfLines={1}>
                {user?.email || 'email@address.com'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Text style={styles.logoutBtnText}>Đăng xuất ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mobile Bottom Tabs
  return (
    <View style={styles.bottomTabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.bottomTabItem,
              isFocused && { backgroundColor: primaryColorLight },
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.bottomTabIcon}>{getEmojiIcon(route.name)}</Text>
            <Text
              style={[
                styles.bottomTabLabel,
                isFocused && { color: primaryColor, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {getLabel(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#eceef0',
    paddingVertical: 24,
    paddingHorizontal: 16,
    zIndex: 1000,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
    gap: 6,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#414755',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eceef0',
    paddingTop: 16,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userFullName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#191c1e',
  },
  userRole: {
    fontSize: 12,
    color: '#717786',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#ffdad6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#ba1a1a',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eceef0',
    height: 76,
    paddingBottom: 12,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    minWidth: 60,
  },
  bottomTabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomTabLabel: {
    fontSize: 9,
    color: '#717786',
    fontWeight: '600',
  },
});
