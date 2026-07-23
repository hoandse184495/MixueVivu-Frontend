import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';

const COLORS = {
    primary: '#006c4b',
    primaryLight: '#e6f4ea',
    bg: '#f7f9fb',
    surface: '#ffffff',
    surfaceMuted: '#f4f7f6',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#d7ddd9',
    success: '#006c4b',
    warning: '#b25e00',
    error: '#ba1a1a',
};

const getNotificationMeta = (item) => {
    const type = String(item.type || '').toLowerCase();
    const status = String(item.status || '').toLowerCase();

    if (type.includes('booking')) {
        return {
            icon: status === 'completed' ? '✓' : '🎫',
            color: status === 'completed' ? COLORS.success : COLORS.primary,
            label: 'Xem đơn đặt tour',
            targetTab: 'ProviderBookingsTab',
        };
    }

    if (type.includes('tour')) {
        const isRejected = type.includes('reject') || status === 'rejected';
        return {
            icon: isRejected ? '!' : '★',
            color: isRejected ? COLORS.error : COLORS.warning,
            label: 'Xem tour của tôi',
            targetTab: 'MyToursTab',
        };
    }

    return {
        icon: 'i',
        color: COLORS.primary,
        label: '',
        targetTab: '',
    };
};

const formatNotificationTime = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function ProviderNotificationsScreen() {
    const navigation = useNavigation();
    const { colors } = useAppTheme();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (showLoading = true) => {
        var _a, _b;
        try {
            if (showLoading) setLoading(true);
            const [notificationRes, unreadRes] = await Promise.all([
                notificationService.getAll(),
                notificationService.getUnreadCount(),
            ]);
            setNotifications(notificationRes.data.data || []);
            setUnreadCount(Number(((_a = unreadRes.data.data) === null || _a === void 0 ? void 0 : _a.count) || 0));
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data?.message) || 'Không thể tải thông báo');
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const unsubscribe = navigation.addListener('focus', () => fetchNotifications(false));
        return unsubscribe;
    }, [fetchNotifications, navigation]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications(false);
    };

    const handleMarkAllAsRead = async () => {
        var _a;
        try {
            await notificationService.markAllAsRead();
            fetchNotifications(false);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data?.message) || 'Không thể đánh dấu đã đọc');
        }
    };

    const handleOpenNotification = async (item) => {
        var _a;
        const meta = getNotificationMeta(item);
        try {
            if (!item.isRead) {
                await notificationService.markAsRead(item.id);
                fetchNotifications(false);
            }
            if (meta.targetTab) {
                navigation.navigate(meta.targetTab);
            }
        }
        catch (error) {
            Alert.alert('Lỗi', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data?.message) || 'Không thể mở thông báo');
        }
    };

    const renderNotification = ({ item }) => {
        const meta = getNotificationMeta(item);
        return (
          <TouchableOpacity
            style={[
                styles.notificationCard,
                { backgroundColor: colors.surface, borderColor: colors.border + '55' },
                !item.isRead && styles.notificationUnread,
            ]}
            onPress={() => handleOpenNotification(item)}
            activeOpacity={0.84}
          >
            <View style={[styles.notificationIcon, { backgroundColor: meta.color }]}>
              <Text style={styles.notificationIconText}>{meta.icon}</Text>
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationTop}>
                <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                {!item.isRead ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={[styles.notificationMessage, { color: colors.textMuted }]}>
                {item.message}
              </Text>
              <View style={styles.notificationFooter}>
                <Text style={styles.notificationTime}>{formatNotificationTime(item.createdAt)}</Text>
                {meta.label ? <Text style={styles.notificationLink}>{meta.label}</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        );
    };

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Thông báo</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Cập nhật booking và tour của bạn'}
            </Text>
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity style={styles.readAllBtn} onPress={handleMarkAllAsRead} activeOpacity={0.84}>
              <Text style={styles.readAllBtnText}>Đã đọc</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.centerText, { color: colors.textMuted }]}>Đang tải thông báo...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có thông báo</Text>
                <Text style={[styles.centerText, { color: colors.textMuted }]}>
                  Khi có booking mới, tour được duyệt hoặc tour hoàn thành, thông báo sẽ xuất hiện ở đây.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
    },
    headerSubtitle: {
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600',
    },
    readAllBtn: {
        height: 40,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    readAllBtnText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '900',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
    notificationUnread: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    notificationIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationIconText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '900',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    notificationTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '900',
        lineHeight: 20,
    },
    unreadDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginTop: 5,
    },
    notificationMessage: {
        marginTop: 5,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
    },
    notificationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    notificationTime: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '700',
    },
    notificationLink: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    centerState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 26,
        paddingVertical: 56,
    },
    centerText: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        fontWeight: '600',
    },
    emptyIcon: {
        fontSize: 42,
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '900',
    },
});
