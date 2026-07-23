import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from './constants';
import { styles } from './styles';

const getNotificationMeta = (item) => {
    const type = item.type?.toLowerCase() || '';

    if (type.includes('payment') || type.includes('thanh_toan') || item.paymentId) {
        const isSuccess = ['paid', 'confirmed'].includes(String(item.status || '').toLowerCase());
        const isDanger = ['failed', 'refunded', 'rejected'].includes(String(item.status || '').toLowerCase());

        return {
            icon: isDanger ? '!' : isSuccess ? '✓' : '$',
            iconStyle: isDanger
                ? styles.notificationIconDanger
                : isSuccess
                    ? styles.notificationIconSuccess
                    : styles.notificationIconPayment,
            linkLabel: 'Xem thanh toán',
            targetTab: 'PaymentsTab',
        };
    }

    if (type.includes('tour') || item.tourId) {
        const isDanger = type.includes('reject') || type.includes('rejected');

        return {
            icon: isDanger ? '!' : '★',
            iconStyle: isDanger ? styles.notificationIconDanger : styles.notificationIconTour,
            linkLabel: 'Xem lịch sử booking',
            targetTab: 'BookingsTab',
        };
    }

    if (type.includes('booking') || item.bookingId) {
        const isDanger = type.includes('reject') || type.includes('cancel');

        return {
            icon: isDanger ? '!' : '✓',
            iconStyle: isDanger ? styles.notificationIconDanger : styles.notificationIconSuccess,
            linkLabel: 'Xem lịch sử booking',
            targetTab: 'BookingsTab',
        };
    }

    return {
        icon: 'i',
        iconStyle: styles.notificationIcon,
        linkLabel: '',
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

export const getNotificationTargetTab = (item) => getNotificationMeta(item).targetTab;

export default function NotificationModal({
    visible,
    unreadCount,
    notifications,
    loading,
    error,
    onClose,
    onMarkAllAsRead,
    onOpenNotification,
    onRetry,
}) {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
          <View style={styles.modalBackdrop}>
            <View style={styles.notificationSheet}>
              <View style={styles.notificationHeader}>
                <View>
                  <Text style={styles.notificationTitle}>Thông báo</Text>
                  <Text style={styles.notificationSubtitle}>
                    {unreadCount > 0
                      ? `${unreadCount} thông báo chưa đọc`
                      : 'Cập nhật trạng thái đơn đặt tour'}
                  </Text>
                </View>
                <View style={styles.notificationHeaderActions}>
                  {unreadCount > 0 ? (
                    <TouchableOpacity style={styles.readAllBtn} onPress={onMarkAllAsRead}>
                      <Text style={styles.readAllBtnText}>Đã đọc</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeBtnText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <View style={styles.notificationEmpty}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.notificationEmptyText}>Đang tải thông báo...</Text>
                </View>
              ) : error ? (
                <View style={styles.notificationEmpty}>
                  <Text style={styles.notificationEmptyTitle}>Có lỗi xảy ra</Text>
                  <Text style={styles.notificationEmptyText}>{error}</Text>
                  <TouchableOpacity style={styles.retryNotificationBtn} onPress={onRetry}>
                    <Text style={styles.retryNotificationText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.notificationEmpty}>
                  <Text style={styles.notificationEmptyTitle}>Chưa có thông báo</Text>
                  <Text style={styles.notificationEmptyText}>
                    Trạng thái đặt tour, tour và thanh toán sẽ hiện tại đây.
                  </Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {notifications.map((item) => {
                    const meta = getNotificationMeta(item);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.notificationItem,
                          !item.isRead && styles.notificationItemUnread,
                        ]}
                        onPress={() => onOpenNotification(item)}
                        activeOpacity={0.82}
                      >
                        <View style={[styles.notificationIcon, meta.iconStyle]}>
                          <Text style={styles.notificationIconText}>{meta.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.notificationItemTop}>
                            <Text style={styles.notificationItemTitle}>{item.title}</Text>
                            <Text style={styles.notificationTime}>
                              {formatNotificationTime(item.createdAt)}
                            </Text>
                          </View>
                          <Text style={styles.notificationMessage}>{item.message}</Text>
                          {meta.linkLabel ? (
                            <Text style={styles.notificationLink}>{meta.linkLabel}</Text>
                          ) : null}
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
