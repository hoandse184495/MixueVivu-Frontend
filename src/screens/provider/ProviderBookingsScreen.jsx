import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { bookingService } from '../../services';
import { formatBookingCode } from '../../utils/bookingDisplay';
import SearchBox from '../../components/common/SearchBox';
import ReasonModal from '../../components/common/ReasonModal';
const COLORS = {
    primary: '#006c4b',
    primaryLight: '#e6f4ea',
    bg: '#f7f9fb',
    surface: '#ffffff',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
};
export default function ProviderBookingsScreen() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [rejectingBookingId, setRejectingBookingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const navigation = useNavigation();
    const fetchBookings = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const response = await bookingService.getProviderBookings();
            setBookings(response.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải danh sách booking');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBookings();
        });
        return unsubscribe;
    }, [navigation, fetchBookings]);
    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredBookings(bookings);
        }
        else {
            setFilteredBookings(bookings.filter((b) => b.status === activeTab));
        }
    }, [bookings, activeTab]);
    const visibleBookings = filteredBookings.filter((booking) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword)
            return true;
        return [
            formatBookingCode(booking.id),
            booking.tourTitle,
            booking.userName,
            booking.userEmail,
            booking.status,
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));
    });
    const handleUpdateStatus = async (id, status, reason = '') => {
        const statusTextMap = {
            confirmed: 'xác nhận',
            cancelled: 'hủy',
        };
        Alert.alert('Xác nhận thay đổi', `Bạn có chắc chắn muốn ${statusTextMap[status]} đơn đặt tour này không?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đồng ý',
                onPress: async () => {
                    var _a, _b;
                    try {
                        if (status === 'confirmed') {
                            await bookingService.providerConfirmBooking(id);
                        }
                        else {
                            await bookingService.providerRejectBooking(id, reason);
                        }
                        Alert.alert('Thành công', 'Cập nhật trạng thái thành công.');
                        fetchBookings();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể cập nhật trạng thái');
                    }
                },
            },
        ]);
    };
    const openRejectModal = (id) => {
        setRejectingBookingId(id);
        setRejectReason('');
    };
    const submitRejectReason = () => {
        if (!rejectingBookingId)
            return;
        if (!rejectReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối booking');
            return;
        }
        const bookingId = rejectingBookingId;
        const reason = rejectReason.trim();
        setRejectingBookingId(null);
        setRejectReason('');
        handleUpdateStatus(bookingId, 'cancelled', reason);
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
        const bookingDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        return (<View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.bookingCodeText}>{formatBookingCode(item.id)}</Text>
            <Text style={styles.tourTitle} numberOfLines={1}>{item.tourTitle || `Tour #${item.tourId}`}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.divider}/>

        <View style={styles.row}>
          <Text style={styles.label}>Khách đặt:</Text>
          <Text style={styles.value}>{item.userName || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Số lượng khách:</Text>
          <Text style={styles.value}>{item.numPeople} khách</Text>
        </View>

        {item.tourAvailableSlots !== undefined && (<View style={styles.row}>
            <Text style={styles.label}>Chỗ còn lại:</Text>
            <Text style={styles.value}>{item.tourAvailableSlots} chỗ</Text>
          </View>)}

        <View style={styles.row}>
          <Text style={styles.label}>Thành tiền:</Text>
          <Text style={styles.priceValue}>{Number(item.totalPrice).toLocaleString('vi-VN')} VNĐ</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>{bookingDate}</Text>
        </View>

        {/* Action buttons based on status */}
        {item.status === 'pending' && (<View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => openRejectModal(item.id)} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleUpdateStatus(item.id, 'confirmed')} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>)}

        {item.status === 'confirmed' && (<View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Đơn đã được provider xác nhận. Manager sẽ hoàn thành tour sau khi xác nhận khách đã chuyển khoản.
            </Text>
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
        <Text style={styles.headerTitle}>Đơn Đặt Tour</Text>
        <Text style={styles.headerSubtitle}>Quản lý lịch trình và trạng thái các yêu cầu đặt tour du lịch của khách hàng</Text>
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

      <SearchBox value={search} onChangeText={setSearch} placeholder="Tìm booking, tour, khách..." borderColor={COLORS.border} textColor={COLORS.text} mutedColor={COLORS.textMuted} backgroundColor={COLORS.surface}/>

      {loading && bookings.length === 0 ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary}/>
          <Text style={styles.loadingText}>Đang tải danh sách đặt tour...</Text>
        </View>) : (<FlatList data={visibleBookings} keyExtractor={(item) => item.id.toString()} renderItem={renderBookingCard} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onRefresh={fetchBookings} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={styles.emptyTitle}>Chưa có booking</Text>
              <Text style={styles.emptySubtitle}>Không tìm thấy yêu cầu đặt tour nào ở trạng thái này.</Text>
            </View>}/>)}

      <ReasonModal visible={rejectingBookingId !== null} title="Lý do từ chối" placeholder="Ví dụ: Tour đã hết chỗ, lịch trình không phù hợp..." value={rejectReason} submitLabel="Từ chối" onChangeText={setRejectReason} onCancel={() => setRejectingBookingId(null)} onSubmit={submitRejectReason}/>
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
    },
    bookingCodeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 3,
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
    infoBox: {
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: '#cde8d8',
    },
    infoText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
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
