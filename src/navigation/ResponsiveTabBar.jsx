import { useWindowDimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useAppTheme } from '../theme/ThemeContext';
import { notificationService } from '../services';
export default function ResponsiveTabBar({ state, descriptors, navigation, onLogout, role, primaryColor, primaryColorLight, }) {
    const { width } = useWindowDimensions();
    const { colors } = useAppTheme();
    const isLargeScreen = width >= 1024;
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        const fetchUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        };
        fetchUser();
    }, []);
    useEffect(() => {
        if (role !== 'provider')
            return;
        let mounted = true;
        const fetchUnreadCount = async () => {
            var _a;
            try {
                const response = await notificationService.getUnreadCount();
                const count = Number(((_a = response.data.data) === null || _a === void 0 ? void 0 : _a.count) || 0);
                if (mounted)
                    setUnreadCount(count);
            }
            catch (error) {
                if (mounted)
                    setUnreadCount(0);
            }
        };
        fetchUnreadCount();
        const timer = setInterval(fetchUnreadCount, 30000);
        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [role, state.index]);
    const shouldShowNotificationBadge = (routeName) => role === 'provider' && routeName.toLowerCase().includes('notifications') && unreadCount > 0;
    const renderNotificationBadge = (routeName, badgeStyle) => {
        if (!shouldShowNotificationBadge(routeName))
            return null;
        return (<View style={[styles.notificationBadge, badgeStyle]}>
          <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>);
    };
    const getEmojiIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('home') || lower.includes('dashboard'))
            return '🏛️';
        if (lower.includes('pending') || lower.includes('mytours'))
            return '🗺️';
        if (lower.includes('bookings') || lower.includes('booking'))
            return '🎫';
        if (lower.includes('guides'))
            return '🧭';
        if (lower.includes('contacts'))
            return '📩';
        if (lower.includes('profile'))
            return '👤';
        if (lower.includes('favorites'))
            return '❤️';
        if (lower.includes('friends'))
            return '👥';
        if (lower.includes('payments'))
            return '💳';
        if (lower.includes('payouts'))
            return '💰';
        if (lower.includes('notifications'))
            return '🔔';
        if (lower.includes('categories'))
            return '🏷️';
        if (lower.includes('users'))
            return '👥';
        if (lower.includes('add'))
            return '➕';
        if (lower.includes('contacts'))
            return '📩';
    };
    const getLabel = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('home') || lower.includes('dashboard'))
            return 'Home';
        if (lower.includes('pending'))
            return 'Duyệt Tour';
        if (lower.includes('mytours'))
            return 'Tours Của Tôi';
        if (lower.includes('bookings'))
            return 'Đơn Đặt Tour';
        if (lower.includes('guides'))
            return 'H.Dẫn Viên';
        if (lower.includes('contacts'))
            return 'Hỗ Trợ';
        if (lower.includes('profile'))
            return 'Tài Khoản';
        if (lower.includes('favorites'))
            return 'Yêu Thích';
        if (lower.includes('friends'))
            return 'Bạn Bè';
        if (lower.includes('payments'))
            return 'Thanh Toán';
        if (lower.includes('payouts'))
            return 'Doanh Thu';
        if (lower.includes('notifications'))
            return 'Thông Báo';
        if (lower.includes('categories'))
            return 'Danh Mục';
        if (lower.includes('users'))
            return 'Người Dùng';
        if (lower.includes('add'))
            return 'Thêm Tour';
        if (lower.includes('contacts'))
            return 'Liên Hệ';
    };
    if (isLargeScreen) {
        return (<View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
        <View style={styles.sidebarHeader}>
          <Text style={[styles.logoText, { color: primaryColor }]}>MixueVivu</Text>
          <View style={[styles.roleBadge, { backgroundColor: primaryColorLight }]}>
            <Text style={[styles.roleBadgeText, { color: primaryColor }]}>
              {role === 'manager' ? 'Admin' : role === 'provider' ? 'Đối tác' : 'Thành viên'}
            </Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, undefined, { merge: true });
                    }
                };
                return (<TouchableOpacity key={route.key} onPress={onPress} style={[
                        styles.sidebarMenuItem,
                        isFocused && { backgroundColor: primaryColorLight, borderColor: primaryColor + '30' },
                    ]} activeOpacity={0.82}>
                <View style={[
                        styles.menuIconWrap,
                        isFocused && { backgroundColor: colors.surface },
                    ]}>
                  <Text style={styles.menuIcon}>{getEmojiIcon(route.name)}</Text>
                  {renderNotificationBadge(route.name, styles.sidebarNotificationBadge)}
                </View>
                <Text style={[
                        styles.menuLabel,
                        { color: colors.textMuted },
                        isFocused && { color: primaryColor, fontWeight: '700' },
                    ]}>
                  {getLabel(route.name)}
                </Text>
              </TouchableOpacity>);
            })}
        </View>

        <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
          <View style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: primaryColorLight }]}>
              <Text style={[styles.avatarText, { color: primaryColor }]}>
                {(user === null || user === void 0 ? void 0 : user.fullName) ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userFullName, { color: colors.text }]} numberOfLines={1}>
                {(user === null || user === void 0 ? void 0 : user.fullName) || 'Người dùng'}
              </Text>
              <Text style={[styles.userRole, { color: colors.textMuted }]} numberOfLines={1}>
                {(user === null || user === void 0 ? void 0 : user.email) || 'email@address.com'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.errorLight }]} onPress={onLogout} activeOpacity={0.8}>
            <Text style={[styles.logoutBtnText, { color: colors.error }]}>Đăng xuất ➔</Text>
          </TouchableOpacity>
        </View>
      </View>);
    }
    // Mobile Bottom Tabs
    return (<View style={[styles.bottomTabBar, { backgroundColor: colors.surface, borderTopColor: colors.border + '45' }]}>
      {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const onPress = () => {
                const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, undefined, { merge: true });
                }
            };
            return (<TouchableOpacity key={route.key} onPress={onPress} style={[
                    styles.bottomTabItem,
                    isFocused && {
                        backgroundColor: primaryColorLight,
                        borderColor: primaryColor + '28',
                        shadowColor: primaryColor,
                    },
                ]} activeOpacity={0.82}>
            <View style={[
                    styles.bottomTabIconWrap,
                    isFocused && { backgroundColor: colors.surface },
                ]}>
              <Text style={[
                    styles.bottomTabIcon,
                    isFocused && styles.bottomTabIconActive,
                ]}>
                {getEmojiIcon(route.name)}
              </Text>
              {renderNotificationBadge(route.name, styles.bottomNotificationBadge)}
            </View>
            <Text style={[
                    styles.bottomTabLabel,
                    { color: colors.textMuted },
                    isFocused && { color: primaryColor, fontWeight: '700' },
                ]} numberOfLines={1}>
              {getLabel(route.name)}
            </Text>
          </TouchableOpacity>);
        })}
    </View>);
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
        gap: 8,
    },
    sidebarMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    menuIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#f6f8fb',
        position: 'relative',
    },
    menuIcon: {
        fontSize: 17,
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
        minHeight: 82,
        paddingBottom: 12,
        paddingTop: 10,
        paddingHorizontal: 4,
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#0f172a',
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: -6 },
    },
    bottomTabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 7,
        paddingHorizontal: 2,
        borderRadius: 14,
        minHeight: 58,
        borderWidth: 1,
        borderColor: 'transparent',
        marginHorizontal: 1,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    bottomTabIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
        position: 'relative',
    },
    bottomTabIcon: {
        fontSize: 17,
    },
    bottomTabIconActive: {
        fontSize: 18,
    },
    bottomTabLabel: {
        fontSize: 9,
        color: '#717786',
        fontWeight: '700',
        lineHeight: 12,
        textAlign: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        paddingHorizontal: 4,
        backgroundColor: '#ba1a1a',
        borderWidth: 1,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sidebarNotificationBadge: {
        top: -5,
        right: -5,
    },
    bottomNotificationBadge: {
        top: -7,
        right: -8,
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 9,
        lineHeight: 12,
        fontWeight: '900',
    },
});
