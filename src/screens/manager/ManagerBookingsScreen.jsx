import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { bookingService, paymentService } from '../../services';
const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    bg: '#f7f9fb',
    surface: '#ffffff',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
};
export default function ManagerBookingsScreen() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [paymentsByBookingId, setPaymentsByBookingId] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const fetchBookings = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const [bookingResponse, paymentResponse] = await Promise.all([
                bookingService.getAllBookings(),
                paymentService.getAllPayments(),
            ]);
            setBookings(bookingResponse.data.data || []);
            setPaymentsByBookingId((paymentResponse.data.data || []).reduce((acc, payment) => {
                if (payment.bookingId) {
                    acc[Number(payment.bookingId)] = {
                        id: payment.id,
                        status: payment.status,
                    };
                }
                return acc;
            }, {}));
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải danh sách booking');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredBookings(bookings);
        }
        else {
            setFilteredBookings(bookings.filter((b) => b.status === activeTab));
        }
    }, [bookings, activeTab]);
    const handleCompleteBooking = async (item) => {
        const payment = paymentsByBookingId[item.id];
        if (item.status !== 'confirmed' || (payment === null || payment === void 0 ? void 0 : payment.status) !== 'paid') {
            Alert.alert('Chưa thể hoàn thành', 'Chỉ hoàn thành tour sau khi provider đã xác nhận booking và manager đã xác nhận khách chuyển khoản.');
            return;
        }
        Alert.alert('Hoàn thành tour', 'Bạn đã xác nhận khách chuyển khoản và muốn hoàn thành tour này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Hoàn thành',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await bookingService.complete(item.id);
                        Alert.alert('Thành công', 'Tour đã được đánh dấu hoàn thành.');
                        fetchBookings();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể hoàn thành tour');
                    }
                },
            },
        ]);
    };
    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case 'paid':
                return { bg: '#e6f4ea', text: '#137333', label: 'Đã nhận tiền' };
            case 'submitted':
                return { bg: '#e8f0fe', text: '#1a73e8', label: 'Khách báo đã chuyển' };
            case 'refunded':
                return { bg: '#fce8e6', text: '#c5221f', label: 'Đã hoàn tiền' };
            case 'failed':
                return { bg: '#fce8e6', text: '#c5221f', label: 'Thanh toán lỗi' };
            case 'pending':
                return { bg: '#fff4e5', text: '#b25e00', label: 'Chờ khách chuyển' };
            default:
                return { bg: '#eceef0', text: '#555', label: 'Chưa có thanh toán' };
        }
    };
    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':
                return { bg: '#fff4e5', text: '#b25e00', label: 'Chờ duyệt' };
            case 'confirmed':
                return { bg: '#e6f4ea', text: '#137333', label: 'Đã xác nhận' };
            case 'cancelled':
                return { bg: '#fce8e6', text: '#c5221f', label: 'Đã hủy' };
            case 'completed':
                return { bg: '#e8f0fe', text: '#1a73e8', label: 'Hoàn thành' };
            default:
                return { bg: '#eceef0', text: '#555', label: status };
        }
    };
    const renderBookingCard = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const payment = paymentsByBookingId[item.id];
        const paymentStatusStyle = getPaymentStatusStyle(payment === null || payment === void 0 ? void 0 : payment.status);
        const canComplete = item.status === 'confirmed' && (payment === null || payment === void 0 ? void 0 : payment.status) === 'paid';
        const bookingDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        return (<View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.tourTitle} numberOfLines={1}>{item.tourTitle || `Tour #${item.tourId}`}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.divider}/>

        <View style={styles.row}>
          <Text style={styles.label}>Khách hàng:</Text>
          <Text style={styles.value}>{item.userName || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số người tham gia:</Text>
          <Text style={styles.value}>{item.numPeople} người</Text>
        </View>

        {item.tourAvailableSlots !== undefined && (<View style={styles.row}>
            <Text style={styles.label}>Chỗ còn lại:</Text>
            <Text style={styles.value}>{item.tourAvailableSlots} chỗ</Text>
          </View>)}

        <View style={styles.row}>
          <Text style={styles.label}>Tổng chi phí:</Text>
          <Text style={styles.priceValue}>{Number(item.totalPrice).toLocaleString('vi-VN')} VNĐ</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Thanh toán:</Text>
          <View style={[styles.paymentBadge, { backgroundColor: paymentStatusStyle.bg }]}>
            <Text style={[styles.paymentBadgeText, { color: paymentStatusStyle.text }]}>
              {paymentStatusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ngày đặt đơn:</Text>
          <Text style={styles.value}>{bookingDate}</Text>
        </View>

        {item.status === 'pending' && (<View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Đang chờ provider chấp nhận booking.
            </Text>
          </View>)}

        {item.status === 'confirmed' && (<View style={styles.actionRow}>
            <TouchableOpacity style={[styles.completeBtn, !canComplete && styles.completeBtnDisabled]} onPress={() => handleCompleteBooking(item)} activeOpacity={0.8}>
              <Text style={[styles.completeBtnText, !canComplete && styles.completeBtnTextDisabled]}>
                {canComplete ? 'Hoàn thành tour' : 'Chưa nhận tiền'}
              </Text>
            </TouchableOpacity>
          </View>)}
      </View>);
    };
    const tabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'confirmed', label: 'Xác nhận' },
        { key: 'completed', label: 'H.Thành' },
        { key: 'cancelled', label: 'Đã hủy' },
    ];
    return (<SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Booking</Text>
        <Text style={styles.headerSubtitle}>Xem chi tiết trạng thái đơn đặt tour và xác nhận đơn của khách hàng</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (<TouchableOpacity key={tab.key} style={[styles.tabButton, isActive && styles.tabButtonActive]} onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>);
        })}
      </View>

      {loading && bookings.length === 0 ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary}/>
          <Text style={styles.loadingText}>Đang tải danh sách booking...</Text>
        </View>) : (<FlatList data={filteredBookings} keyExtractor={(item) => item.id.toString()} renderItem={renderBookingCard} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onRefresh={fetchBookings} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎟️</Text>
              <Text style={styles.emptyTitle}>Trống lịch đặt</Text>
              <Text style={styles.emptySubtitle}>Không tìm thấy booking nào thuộc trạng thái này.</Text>
            </View>}/>)}
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 4,
        lineHeight: 18,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eceef0',
        gap: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: {
        backgroundColor: COLORS.primaryLight,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    tabLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textMuted,
        fontSize: 14,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eceef0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tourTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#eceef0',
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '700',
    },
    paymentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    paymentBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    infoBox: {
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: '#c8dafc',
    },
    infoText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#fce8e6',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#c5221f',
        fontWeight: '700',
        fontSize: 13,
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#e6f4ea',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#137333',
        fontWeight: '700',
        fontSize: 13,
    },
    completeBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    completeBtnDisabled: {
        backgroundColor: '#eef1f5',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    completeBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
    completeBtnTextDisabled: {
        color: COLORS.textMuted,
    },
    emptyContainer: {
        paddingTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
