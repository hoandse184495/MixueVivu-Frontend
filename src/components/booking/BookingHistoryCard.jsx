import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { TourImage } from '../TourImage';
import { formatBookingCode } from '../../utils/bookingDisplay';
const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
    success: '#006c4b',
    successLight: '#e6f4ee',
    warning: '#894d00',
    warningLight: '#fff3e0',
    error: '#ba1a1a',
    errorLight: '#fdecea',
};
const STATUS_CONFIG = {
    pending: { label: 'Chờ xử lý', bg: COLORS.warningLight, color: COLORS.warning, emoji: '⏳' },
    confirmed: { label: 'Đã xác nhận', bg: COLORS.primaryLight, color: COLORS.primary, emoji: '✅' },
    completed: { label: 'Hoàn thành', bg: COLORS.successLight, color: COLORS.success, emoji: '🎉' },
    cancelled: { label: 'Đã hủy', bg: COLORS.errorLight, color: COLORS.error, emoji: '❌' },
};
const getPaymentStatusStyle = (status) => {
    switch (status) {
        case 'paid':
            return { bg: COLORS.successLight, text: COLORS.success, label: 'Đã thanh toán' };
        case 'submitted':
            return { bg: COLORS.primaryLight, text: COLORS.primary, label: 'Chờ manager xác nhận' };
        case 'pending':
        default:
            return { bg: COLORS.warningLight, text: COLORS.warning, label: 'Chưa thanh toán' };
    }
};
export default function BookingHistoryCard({ booking, payment, colors, onCancel, onOpenDetail, onOpenReview, }) {
    const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    const paymentStatusStyle = getPaymentStatusStyle(payment === null || payment === void 0 ? void 0 : payment.status);
    return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
      <View style={styles.cardTop}>
        <View style={styles.thumbContainer}>
          <TourImage uri={booking.tourImage} style={styles.thumb} fallbackIconSize={28}/>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardInfoTop}>
            <View style={styles.bookingCodeBadge}>
              <Text style={styles.bookingCodeText}>{formatBookingCode(booking.id)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {statusCfg.emoji} {statusCfg.label}
              </Text>
            </View>
            {booking.status === 'confirmed' ? (<View style={[styles.paymentBadge, { backgroundColor: paymentStatusStyle.bg }]}>
                <Text style={[styles.paymentBadgeText, { color: paymentStatusStyle.text }]}>
                  {paymentStatusStyle.label}
                </Text>
              </View>) : null}
          </View>

          <Text style={[styles.tourName, { color: colors.text }]} numberOfLines={2}>
            {booking.tourTitle || `Tour #${booking.tourId}`}
          </Text>

          {booking.tourLocation ? (<Text style={[styles.locationText, { color: colors.textMuted }]}>📍 {booking.tourLocation}</Text>) : null}

          {booking.tourStartDate ? (<View style={styles.dateRow}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>
                {new Date(booking.tourStartDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>) : null}
        </View>
      </View>

      <View style={styles.cardDivider}/>

      <View style={styles.cardBottom}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestIcon}>👥</Text>
          <Text style={styles.guestText}>{booking.numPeople} người</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Tổng tiền</Text>
          <Text style={styles.priceValue}>
            {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
          </Text>
        </View>
      </View>

      {booking.status === 'pending' ? (<TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>❌ Hủy booking</Text>
        </TouchableOpacity>) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.detailBtn} onPress={onOpenDetail}>
          <Text style={styles.detailBtnText}>Chi tiết</Text>
        </TouchableOpacity>
        {booking.status === 'completed' ? (<TouchableOpacity style={styles.reviewBtn} onPress={onOpenReview}>
            <Text style={styles.reviewBtnText}>Đánh giá</Text>
          </TouchableOpacity>) : null}
      </View>
    </View>);
}
const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        marginBottom: 14,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        borderWidth: 1,
    },
    cardTop: {
        flexDirection: 'row',
        padding: 14,
        gap: 12,
    },
    thumbContainer: {
        width: 88,
        height: 88,
        borderRadius: 14,
        overflow: 'hidden',
        flexShrink: 0,
    },
    thumb: {
        width: '100%',
        height: '100%',
    },
    cardInfo: {
        flex: 1,
    },
    cardInfoTop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    bookingCodeBadge: {
        alignSelf: 'flex-start',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: COLORS.primaryLight,
    },
    bookingCodeText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.primary,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0,
    },
    paymentBadge: {
        alignSelf: 'flex-start',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    paymentBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0,
    },
    tourName: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
        lineHeight: 20,
    },
    locationText: {
        fontSize: 12,
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateIcon: {
        fontSize: 12,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    cardDivider: {
        height: 1,
        backgroundColor: COLORS.border + '40',
        marginHorizontal: 14,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    guestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    guestIcon: {
        fontSize: 16,
    },
    guestText: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    priceInfo: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.primary,
    },
    cancelBtn: {
        marginHorizontal: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.error,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: COLORS.error,
        fontWeight: '700',
        fontSize: 13,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 14,
        paddingBottom: 14,
    },
    detailBtn: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailBtnText: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 13,
    },
    reviewBtn: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        backgroundColor: COLORS.successLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewBtnText: {
        color: COLORS.success,
        fontWeight: '800',
        fontSize: 13,
    },
});
