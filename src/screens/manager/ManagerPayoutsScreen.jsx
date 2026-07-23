import { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { adminService, bookingService, payoutService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import SearchBox from '../../components/common/SearchBox';
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
    errorLight: '#ffebee',
};
const STATUS_CONFIG = {
    pending: { label: 'Chờ trả provider', bg: COLORS.warningLight, color: COLORS.warning, emoji: '⏳' },
    processing: { label: 'Đang xử lý', bg: COLORS.primaryLight, color: COLORS.primary, emoji: '...' },
    paid: { label: 'Đã trả provider', bg: COLORS.successLight, color: COLORS.success, emoji: '✅' },
    not_created: { label: 'Chưa tạo phiếu trả', bg: COLORS.errorLight, color: COLORS.error, emoji: '!' },
};
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}₫`;
const getProviderKey = (payout) => { var _a, _b, _c; return String((_c = (_b = (_a = payout.providerId) !== null && _a !== void 0 ? _a : payout.providerEmail) !== null && _b !== void 0 ? _b : payout.providerName) !== null && _c !== void 0 ? _c : 'unknown'); };
const getBookingProviderKey = (booking) => { var _a, _b, _c; return String((_c = (_b = (_a = booking.providerId) !== null && _a !== void 0 ? _a : booking.providerEmail) !== null && _b !== void 0 ? _b : booking.providerName) !== null && _c !== void 0 ? _c : 'unknown'); };
const emptySummary = {
    key: 'all',
    providerName: 'Tất cả provider',
    bookings: [],
    payoutCount: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalProviderAmount: 0,
    paidProviderAmount: 0,
    pendingProviderAmount: 0,
};
export default function ManagerPayoutsScreen() {
    const { colors } = useAppTheme();
    const [payouts, setPayouts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProviderKey, setSelectedProviderKey] = useState('all');
    const [search, setSearch] = useState('');
    const fetchRevenueData = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const [payoutRes, bookingRes, userRes] = await Promise.all([
                payoutService.getAllPayouts(),
                bookingService.getAllBookings(),
                adminService.getAllUsers(),
            ]);
            setPayouts(payoutRes.data.data || []);
            setBookings(bookingRes.data.data || []);
            setProviders((userRes.data.data || []).filter((user) => user.role === 'provider'));
        }
        catch (e) {
            Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải dữ liệu doanh thu');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchRevenueData();
    }, [fetchRevenueData]);
    const providerGroups = useMemo(() => {
        const groups = providers.reduce((acc, provider) => {
            var _a, _b, _c, _d;
            const key = String((_d = (_c = (_b = (_a = provider.id) !== null && _a !== void 0 ? _a : provider.email) !== null && _b !== void 0 ? _b : provider.fullName) !== null && _c !== void 0 ? _c : provider.companyName) !== null && _d !== void 0 ? _d : 'unknown');
            acc[key] = {
                key,
                providerId: provider.id,
                providerName: provider.companyName || provider.fullName || 'Nhà cung cấp',
                providerEmail: provider.email,
                bookings: [],
                payoutCount: 0,
                totalRevenue: 0,
                totalCommission: 0,
                totalProviderAmount: 0,
                paidProviderAmount: 0,
                pendingProviderAmount: 0,
            };
            return acc;
        }, {});
        const payoutByBookingId = payouts.reduce((acc, payout) => {
            acc[String(payout.bookingId)] = payout;
            return acc;
        }, {});
        const revenueBookings = bookings.filter((booking) => booking.status === 'completed');
        revenueBookings.forEach((booking) => {
            const key = getBookingProviderKey(booking);
            if (!groups[key]) {
                groups[key] = {
                    key,
                    providerId: booking.providerId,
                    providerName: booking.providerName || 'Nhà cung cấp',
                    providerEmail: booking.providerEmail,
                    bookings: [],
                    payoutCount: 0,
                    totalRevenue: 0,
                    totalCommission: 0,
                    totalProviderAmount: 0,
                    paidProviderAmount: 0,
                    pendingProviderAmount: 0,
                };
            }
            const payout = payoutByBookingId[String(booking.id)];
            const revenue = Number(booking.totalPrice || 0);
            const commission = Number(booking.commissionAmount || 0);
            const providerAmount = Number(booking.providerAmount || 0);
            groups[key].bookings.push({ ...booking, payout });
            if (payout)
                groups[key].payoutCount += 1;
            groups[key].totalRevenue += revenue;
            groups[key].totalCommission += commission;
            groups[key].totalProviderAmount += providerAmount;
            if ((payout === null || payout === void 0 ? void 0 : payout.status) === 'paid') {
                groups[key].paidProviderAmount += providerAmount;
            }
            else {
                groups[key].pendingProviderAmount += providerAmount;
            }
        });
        return Object.values(groups).sort((a, b) => b.pendingProviderAmount - a.pendingProviderAmount || b.totalRevenue - a.totalRevenue);
    }, [bookings, payouts, providers]);
    const allSummary = useMemo(() => providerGroups.reduce((summary, provider) => ({
        ...summary,
        bookings: [...summary.bookings, ...provider.bookings],
        payoutCount: summary.payoutCount + provider.payoutCount,
        totalRevenue: summary.totalRevenue + provider.totalRevenue,
        totalCommission: summary.totalCommission + provider.totalCommission,
        totalProviderAmount: summary.totalProviderAmount + provider.totalProviderAmount,
        paidProviderAmount: summary.paidProviderAmount + provider.paidProviderAmount,
        pendingProviderAmount: summary.pendingProviderAmount + provider.pendingProviderAmount,
    }), { ...emptySummary, bookings: [] }), [providerGroups]);
    const selectedProvider = selectedProviderKey === 'all'
        ? allSummary
        : providerGroups.find((provider) => provider.key === selectedProviderKey) || allSummary;
    const visibleRevenueBookings = (selectedProviderKey === 'all'
        ? allSummary.bookings
        : selectedProvider.bookings).filter((booking) => {
        var _a, _b;
        const keyword = search.trim().toLowerCase();
        if (!keyword)
            return true;
        return [
            `booking #${booking.id}`,
            booking.tourTitle,
            booking.fullName,
            booking.providerName,
            booking.providerEmail,
            ((_a = booking.payout) === null || _a === void 0 ? void 0 : _a.id) ? `phiếu #${booking.payout.id}` : '',
            (_b = booking.payout) === null || _b === void 0 ? void 0 : _b.status,
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));
    });
    const handleConfirm = (id) => {
        Alert.alert('Xác nhận đã trả provider', 'Bạn đã chuyển khoản khoản doanh thu này cho provider?', [
            { text: 'Chưa', style: 'cancel' },
            {
                text: 'Đã chuyển',
                style: 'default',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await payoutService.confirmPayout(id);
                        Alert.alert('Thành công', 'Đã xác nhận trả tiền cho provider.');
                        fetchRevenueData();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể xác nhận');
                    }
                },
            },
        ]);
    };
    const renderSummaryCard = (label, value, tone) => {
        const toneStyle = {
            primary: { bg: COLORS.primaryLight, color: COLORS.primary },
            success: { bg: COLORS.successLight, color: COLORS.success },
            warning: { bg: COLORS.warningLight, color: COLORS.warning },
            muted: { bg: colors.bg, color: colors.text },
        }[tone];
        return (<View style={[styles.summaryCard, { backgroundColor: toneStyle.bg }]}>
        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.summaryValue, { color: toneStyle.color }]}>{formatCurrency(value)}</Text>
      </View>);
    };
    const renderProviderChip = (provider) => {
        const active = selectedProviderKey === provider.key;
        return (<TouchableOpacity key={provider.key} style={[
                styles.providerChip,
                {
                    backgroundColor: active ? COLORS.primary : colors.surface,
                    borderColor: active ? COLORS.primary : colors.border + '70',
                },
            ]} onPress={() => setSelectedProviderKey(provider.key)} activeOpacity={0.85} hitSlop={8}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.providerChipName, { color: active ? '#fff' : colors.text }]}>
            {provider.providerName}
          </Text>
          <Text style={[styles.providerChipAmount, { color: active ? '#dce9ff' : colors.textMuted }]}>
            Cần trả {formatCurrency(provider.pendingProviderAmount)}
          </Text>
        </View>
        <Text style={[styles.providerChipState, { color: active ? '#fff' : COLORS.primary }]}>
          {active ? 'Đang chọn' : 'Chọn'}
        </Text>
      </TouchableOpacity>);
    };
    const renderListHeader = () => (<View>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: COLORS.primary }]}>DOANH THU PROVIDER</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Quản lý doanh thu và khoản phải trả</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
          Chọn từng provider để xem doanh thu phát sinh, hoa hồng giữ lại và số tiền cần chuyển.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        {renderSummaryCard('Doanh thu', selectedProvider.totalRevenue, 'primary')}
        {renderSummaryCard('Trả provider', selectedProvider.totalProviderAmount, 'success')}
        {renderSummaryCard('Hoa hồng', selectedProvider.totalCommission, 'muted')}
        {renderSummaryCard('Chưa trả', selectedProvider.pendingProviderAmount, 'warning')}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chọn provider</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            {providerGroups.length} provider có booking hoàn thành
          </Text>
        </View>
      </View>

      <View style={styles.providerChips}>
        {renderProviderChip(allSummary)}
        {providerGroups.map(renderProviderChip)}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedProviderKey === 'all'
            ? 'Tất cả phiếu doanh thu'
            : `Phiếu doanh thu - ${selectedProvider.providerName}`}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            {visibleRevenueBookings.length} booking, đã trả {formatCurrency(selectedProvider.paidProviderAmount)}
          </Text>
        </View>
      </View>
    </View>);
    const renderPayoutCard = ({ item }) => {
        const payout = item.payout;
        const statusCfg = STATUS_CONFIG[(payout === null || payout === void 0 ? void 0 : payout.status) || 'not_created'] || STATUS_CONFIG.not_created;
        return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '35' }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.payoutId, { color: colors.textMuted }]}>
              Booking #{item.id}{payout ? ` - Phiếu #${payout.id}` : ''}
            </Text>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.tourTitle || item.fullName || 'Doanh thu tour'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.emoji} {statusCfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Provider</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.providerName || 'Nhà cung cấp'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Hoa hồng manager</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatCurrency(Number(item.commissionAmount || 0))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Ngày tạo</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider}/>

        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Doanh thu</Text>
            <Text style={[styles.revenueValue, { color: colors.text }]}>{formatCurrency(Number(item.totalPrice || 0))}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Trả provider</Text>
            <Text style={styles.providerAmountValue}>{formatCurrency(Number(item.providerAmount || 0))}</Text>
          </View>
        </View>

        {(payout === null || payout === void 0 ? void 0 : payout.status) === 'pending' && (<TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(payout.id)} activeOpacity={0.85}>
            <Text style={styles.confirmBtnText}>Xác nhận đã trả provider</Text>
          </TouchableOpacity>)}
      </View>);
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Doanh thu</Text>
      </View>
      <SearchBox value={search} onChangeText={setSearch} placeholder="Tìm provider, tour, booking, phiếu..." borderColor={colors.border} textColor={colors.text} mutedColor={colors.textMuted} backgroundColor={colors.surface}/>

      {loading ? (<ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }}/>) : (<FlatList data={visibleRevenueBookings} keyExtractor={(item) => item.id.toString()} renderItem={renderPayoutCard} contentContainerStyle={styles.listContent} onRefresh={fetchRevenueData} refreshing={loading} ListHeaderComponent={renderListHeader} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💰</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có doanh thu</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Khi booking hoàn thành, doanh thu và khoản trả provider sẽ xuất hiện ở đây.
              </Text>
            </View>}/>)}
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    hero: {
        marginBottom: 16,
    },
    kicker: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0,
        marginBottom: 6,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 18,
    },
    summaryCard: {
        width: '48%',
        borderRadius: 12,
        padding: 14,
        minHeight: 86,
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '900',
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    sectionSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 3,
    },
    providerChips: {
        gap: 10,
        marginBottom: 18,
    },
    providerChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 64,
    },
    providerChipName: {
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 4,
    },
    providerChipAmount: {
        fontSize: 12,
        fontWeight: '700',
    },
    providerChipState: {
        fontSize: 12,
        fontWeight: '900',
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 14,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 12,
    },
    payoutId: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '900',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    cardBody: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    value: {
        flex: 1,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        backgroundColor: COLORS.border + '30',
        marginVertical: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    revenueValue: {
        fontSize: 17,
        fontWeight: '900',
        marginTop: 4,
    },
    providerAmountValue: {
        fontSize: 19,
        fontWeight: '900',
        color: COLORS.primary,
        marginTop: 4,
    },
    confirmBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 14,
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '900',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 20,
    },
});
