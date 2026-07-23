import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { formatBookingCode } from '../../utils/bookingDisplay';
import { tourFromBooking } from '../../utils/tourFromBooking';
import BookingTimeline from '../../components/booking/BookingTimeline';
import PaymentTransferCard from '../../components/booking/PaymentTransferCard';
const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    bg: '#f7f9fb',
    surface: '#ffffff',
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
export default function BookingDetailScreen({ navigation, route }) {
    var _a, _b;
    const { colors } = useAppTheme();
    const { booking, payment } = route.params;
    const totalAmount = Number((_b = (_a = payment === null || payment === void 0 ? void 0 : payment.amount) !== null && _a !== void 0 ? _a : booking.totalPrice) !== null && _b !== void 0 ? _b : 0);
    const openReview = () => {
        navigation.navigate('TourDetail', {
            initialTab: 'rating',
            tour: tourFromBooking(booking),
        });
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết booking</Text>
        <View style={{ width: 40 }}/>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={styles.codeLabel}>Mã booking</Text>
          <Text style={styles.bookingCode}>{formatBookingCode(booking.id)}</Text>
          <Text style={[styles.tourTitle, { color: colors.text }]}>
            {booking.tourTitle || `Tour #${booking.tourId}`}
          </Text>
          <Text style={styles.metaText}>Trạng thái booking: {booking.status}</Text>
          <Text style={styles.metaText}>Trạng thái thanh toán: {(payment === null || payment === void 0 ? void 0 : payment.status) || 'pending'}</Text>
          {booking.note ? <Text style={styles.noteText}>Ghi chú: {booking.note}</Text> : null}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
          <BookingTimeline bookingStatus={booking.status} paymentStatus={payment === null || payment === void 0 ? void 0 : payment.status}/>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thanh toán</Text>
          <PaymentTransferCard bookingId={booking.id} paymentId={payment === null || payment === void 0 ? void 0 : payment.id} amount={totalAmount}/>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin tour</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số người</Text>
            <Text style={styles.infoValue}>{booking.numPeople} người</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa điểm</Text>
            <Text style={styles.infoValue}>{booking.tourLocation || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời lượng</Text>
            <Text style={styles.infoValue}>{booking.tourDuration || 'N/A'}</Text>
          </View>
        </View>

        {booking.status === 'completed' ? (<TouchableOpacity style={styles.reviewBtn} onPress={openReview}>
            <Text style={styles.reviewBtnText}>Đánh giá tour</Text>
          </TouchableOpacity>) : null}
      </ScrollView>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        minHeight: 58,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: { color: COLORS.primary, fontSize: 18, fontWeight: '900' },
    headerTitle: { fontSize: 17, fontWeight: '900' },
    content: { padding: 16, paddingBottom: 40, gap: 14 },
    card: {
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e6eaf2',
    },
    codeLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '800' },
    bookingCode: { color: COLORS.primary, fontSize: 22, fontWeight: '900', marginTop: 4 },
    tourTitle: { fontSize: 17, fontWeight: '900', marginTop: 10, marginBottom: 6 },
    metaText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700', marginTop: 3 },
    noteText: {
        color: COLORS.warning,
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
        marginTop: 8,
    },
    sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#edf1f6',
    },
    infoLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
    infoValue: { flex: 1, textAlign: 'right', color: COLORS.text, fontSize: 13, fontWeight: '800' },
    reviewBtn: {
        height: 50,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewBtnText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
