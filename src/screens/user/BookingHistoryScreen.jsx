import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { bookingService, paymentService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import { prefetchTourImages } from '../../components/TourImage';
import { formatBookingCode } from '../../utils/bookingDisplay';
import { tourFromBooking } from '../../utils/tourFromBooking';
import SearchBox from '../../components/common/SearchBox';
import BookingHistoryCard from '../../components/booking/BookingHistoryCard';
const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    primaryFixed: '#d8e2ff',
    bg: '#f7f9fb',
    surface: '#ffffff',
    surfaceContainer: '#eceef0',
    surfaceContainerLow: '#f2f4f6',
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
const TABS = [
    { key: 'all', label: 'Tất cả', emoji: '📋' },
    { key: 'pending', label: 'Chờ duyệt', emoji: '⏳' },
    { key: 'confirmed', label: 'Đã xác nhận', emoji: '✅' },
    { key: 'completed', label: 'Hoàn thành', emoji: '🎉' },
    { key: 'cancelled', label: 'Đã hủy', emoji: '❌' },
];
export default function BookingHistoryScreen({ navigation }) {
    var _a, _b;
    const { colors } = useAppTheme();
    const [bookings, setBookings] = useState([]);
    const [paymentsByBookingId, setPaymentsByBookingId] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const fetchBookings = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const [bookingRes, paymentRes] = await Promise.all([
                bookingService.getMyBookings(),
                paymentService.getMyPayments(),
            ]);
            const nextBookings = (bookingRes.data.data || []).filter((booking) => ['pending', 'confirmed', 'completed', 'cancelled'].includes(booking.status));
            setBookings(nextBookings);
            setPaymentsByBookingId((paymentRes.data.data || []).reduce((acc, payment) => {
                if (payment.bookingId) {
                    acc[Number(payment.bookingId)] = {
                        id: payment.id,
                        status: payment.status,
                        amount: payment.amount,
                    };
                }
                return acc;
            }, {}));
            prefetchTourImages(nextBookings.map((booking) => booking.tourImage));
        }
        catch (e) {
            Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải lịch sử');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    const filteredBookings = (activeTab === 'all'
        ? bookings
        : bookings.filter((b) => b.status === activeTab)).filter((booking) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword)
            return true;
        return [
            formatBookingCode(booking.id),
            booking.tourTitle,
            booking.tourLocation,
            booking.status,
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));
    });
    const handleCancel = (bookingId) => {
        Alert.alert('Hủy booking', 'Bạn có chắc muốn hủy booking này không?', [
            { text: 'Không', style: 'cancel' },
            {
                text: 'Hủy booking',
                style: 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await bookingService.cancel(bookingId);
                        Alert.alert('Đã hủy', 'Booking đã được hủy thành công');
                        fetchBookings();
                    }
                    catch (e) {
                        Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể hủy');
                    }
                },
            },
        ]);
    };
    const renderBookingCard = ({ item }) => {
        const payment = paymentsByBookingId[item.id];
        return (<BookingHistoryCard booking={item} payment={payment} colors={colors} onCancel={() => handleCancel(item.id)} onOpenDetail={() => navigation === null || navigation === void 0 ? void 0 : navigation.navigate('BookingDetail', { booking: item, payment })} onOpenReview={() => navigation === null || navigation === void 0 ? void 0 : navigation.navigate('TourDetail', {
                initialTab: 'rating',
                tour: tourFromBooking(item),
            })}/>);
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lịch sử đặt tour</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Quản lý chuyến đi của bạn</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border + '50' }]}>
        <SearchBox value={search} onChangeText={setSearch} placeholder="Tìm mã booking, tour, địa điểm..." borderColor={colors.border} textColor={colors.text} mutedColor={colors.textMuted} backgroundColor={colors.surface}/>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {TABS.map((tab) => (<TouchableOpacity key={tab.key} style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
            ]} onPress={() => setActiveTab(tab.key)}>
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
            ]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator}/>}
            </TouchableOpacity>))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (<ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }}/>) : (<FlatList data={filteredBookings} keyExtractor={(item) => item.id.toString()} renderItem={renderBookingCard} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false} onRefresh={fetchBookings} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={{ fontSize: 40 }}>🎫</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có booking nào</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {activeTab === 'all'
                    ? 'Hãy khám phá và đặt tour ngay!'
                    : `Không có tour ${(_b = (_a = TABS.find(t => t.key === activeTab)) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.toLowerCase()}`}
              </Text>
              {activeTab === 'all' && (<TouchableOpacity style={styles.exploreBtn} onPress={() => {
                        navigation === null || navigation === void 0 ? void 0 : navigation.navigate('HomeTab', {
                            screen: 'UserHome',
                        });
                    }} activeOpacity={0.85}>
                  <Text style={styles.exploreBtnText}>Khám phá tour →</Text>
                </TouchableOpacity>)}
            </View>}/>)}
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '40',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    // Tab Bar
    tabBarContainer: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '50',
    },
    tabBarContent: {
        paddingHorizontal: 16,
        gap: 4,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        position: 'relative',
    },
    tabActive: {},
    tabEmoji: {
        fontSize: 14,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    tabLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 70,
        paddingBottom: 40,
    },
    emptyIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: COLORS.surfaceContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    exploreBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    exploreBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});
