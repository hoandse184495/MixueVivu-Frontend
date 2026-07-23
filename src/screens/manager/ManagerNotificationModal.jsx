import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    surface: '#ffffff',
    surfaceMuted: '#f7f9fb',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#d7dee8',
    success: '#006c4b',
    warning: '#b45309',
    error: '#ba1a1a',
};

const getNotificationMeta = (item) => {
    const type = String(item.type || '').toLowerCase();
    const status = String(item.status || '').toLowerCase();

    if (type.includes('provider')) {
        return {
            icon: '🏢',
            color: COLORS.primary,
            label: 'Xem người dùng',
            targetTab: 'UsersTab',
        };
    }

    if (type.includes('tour')) {
        return {
            icon: status === 'rejected' ? '!' : '🗺️',
            color: status === 'rejected' ? COLORS.error : COLORS.warning,
            label: 'Xem duyệt tour',
            targetTab: 'PendingToursTab',
        };
    }

    if (type.includes('payment')) {
        return {
            icon: '💳',
            color: status === 'refunded' ? COLORS.error : COLORS.primary,
            label: 'Xem thanh toán',
            targetTab: 'PaymentsTab',
        };
    }

    if (type.includes('booking')) {
        return {
            icon: status === 'completed' ? '✓' : '🎫',
            color: status === 'completed' ? COLORS.success : COLORS.primary,
            label: 'Xem booking',
            targetTab: 'ManagerBookingsTab',
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
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getManagerNotificationTargetTab = (item) => getNotificationMeta(item).targetTab;

export default function ManagerNotificationModal({
    visible,
    notifications,
    unreadCount,
    loading,
    onClose,
    onRetry,
    onMarkAllAsRead,
    onOpenNotification,
}) {
    return (
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Thông báo admin</Text>
                <Text style={styles.subtitle}>
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Các sự kiện vận hành chính'}
                </Text>
              </View>
              <View style={styles.headerActions}>
                {unreadCount > 0 ? (
                  <TouchableOpacity style={styles.readAllBtn} onPress={onMarkAllAsRead} activeOpacity={0.84}>
                    <Text style={styles.readAllText}>Đã đọc</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.84}>
                  <Text style={styles.closeText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.emptyText}>Đang tải thông báo...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
                <Text style={styles.emptyText}>
                  Provider đăng ký, tour chờ duyệt, booking mới và thanh toán sẽ hiện ở đây.
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.84}>
                  <Text style={styles.retryText}>Tải lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((item) => {
                    const meta = getNotificationMeta(item);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.item, !item.isRead && styles.itemUnread]}
                        onPress={() => onOpenNotification(item, meta.targetTab)}
                        activeOpacity={0.84}
                      >
                        <View style={[styles.iconWrap, { backgroundColor: meta.color }]}>
                          <Text style={styles.iconText}>{meta.icon}</Text>
                        </View>
                        <View style={styles.itemContent}>
                          <View style={styles.itemTop}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            {!item.isRead ? <View style={styles.unreadDot} /> : null}
                          </View>
                          <Text style={styles.itemMessage}>{item.message}</Text>
                          <View style={styles.itemFooter}>
                            <Text style={styles.timeText}>{formatNotificationTime(item.createdAt)}</Text>
                            {meta.label ? <Text style={styles.linkText}>{meta.label}</Text> : null}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.42)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '80%',
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 28,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
    },
    subtitle: {
        marginTop: 3,
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    readAllBtn: {
        height: 38,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: 'center',
    },
    readAllText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '900',
    },
    closeBtn: {
        height: 38,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
    },
    closeText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '900',
    },
    item: {
        flexDirection: 'row',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border + '80',
        backgroundColor: COLORS.surfaceMuted,
        marginBottom: 10,
    },
    itemUnread: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900',
    },
    itemContent: {
        flex: 1,
    },
    itemTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    itemTitle: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '900',
    },
    unreadDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginTop: 5,
    },
    itemMessage: {
        marginTop: 5,
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginTop: 9,
    },
    timeText: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '700',
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 44,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 6,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        fontWeight: '600',
        marginTop: 8,
    },
    retryBtn: {
        marginTop: 16,
        minHeight: 40,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
    },
    retryText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900',
    },
});
