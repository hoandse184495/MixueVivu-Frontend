import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { paymentService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import { formatBookingCode, formatPaymentCode } from '../../utils/bookingDisplay';
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
const STATUS_CONFIG = {
    pending: { label: 'Chờ xử lý', bg: COLORS.warningLight, color: COLORS.warning, emoji: '⏳' },
    submitted: { label: 'Chờ xác nhận', bg: COLORS.primaryLight, color: COLORS.primary, emoji: '📨' },
    paid: { label: 'Đã thanh toán', bg: COLORS.successLight, color: COLORS.success, emoji: '✅' },
    refunded: { label: 'Đã hoàn tiền', bg: COLORS.errorLight, color: COLORS.error, emoji: '💵' },
    failed: { label: 'Thất bại', bg: COLORS.errorLight, color: COLORS.error, emoji: '!' },
};
export default function UserPaymentsScreen() {
    const { colors } = useAppTheme();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterDay, setFilterDay] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [appliedDateFilter, setAppliedDateFilter] = useState({
        day: '',
        month: '',
        year: '',
    });
    const fetchPayments = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const res = await paymentService.getMyPayments();
            setPayments(res.data.data || []);
        }
        catch (e) {
            Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải lịch sử thanh toán');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchPayments();
    }, []);
    const submitPayment = (id) => {
        Alert.alert('Xác nhận chuyển khoản', 'Bạn đã chuyển khoản theo thông tin thanh toán của booking này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Tôi đã chuyển',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await paymentService.submitPayment(id, {
                            note: 'Customer confirmed bank transfer from mobile app',
                        });
                        fetchPayments();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể gửi xác nhận thanh toán');
                    }
                },
            },
        ]);
    };
    const filteredPayments = payments.filter((payment) => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (keyword) {
            const searchableValues = [
                formatPaymentCode(payment.id),
                formatBookingCode(payment.bookingId),
                payment.tourTitle,
                payment.status,
                payment.method === 'bank_transfer' ? 'Chuyển khoản' : payment.method,
                String(payment.amount || ''),
            ];
            const matchedKeyword = searchableValues
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword));
            if (!matchedKeyword)
                return false;
        }
        const dateValue = payment.paidAt || payment.createdAt;
        if (!dateValue)
            return !appliedDateFilter.day && !appliedDateFilter.month && !appliedDateFilter.year;
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime()))
            return false;
        const day = String(date.getDate());
        const month = String(date.getMonth() + 1);
        const year = String(date.getFullYear());
        return (!appliedDateFilter.day || day === String(Number(appliedDateFilter.day))) &&
            (!appliedDateFilter.month || month === String(Number(appliedDateFilter.month))) &&
            (!appliedDateFilter.year || year === appliedDateFilter.year.trim());
    });
    const applyDateFilters = () => {
        setAppliedDateFilter({
            day: filterDay.trim(),
            month: filterMonth.trim(),
            year: filterYear.trim(),
        });
        setShowDateFilter(false);
    };
    const clearDateFilters = () => {
        setFilterDay('');
        setFilterMonth('');
        setFilterYear('');
        setAppliedDateFilter({ day: '', month: '', year: '' });
    };
    const clearSearch = () => {
        setSearchKeyword('');
    };
    const renderPaymentCard = ({ item }) => {
        const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.transactionId, { color: colors.textMuted }]}>
            {formatPaymentCode(item.id)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.emoji} {statusCfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Mã Booking:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatBookingCode(item.bookingId)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Phương thức:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.method === 'bank_transfer' ? 'Chuyển khoản' : item.method}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Ngày tạo:</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          {item.paidAt && (<View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Ngày thanh toán:</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(item.paidAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>)}
        </View>

        <View style={styles.cardDivider}/>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Số tiền</Text>
          <Text style={styles.amountValue}>
            {Number(item.amount).toLocaleString('vi-VN')}₫
          </Text>
        </View>

        {item.status === 'pending' ? (<View style={styles.paymentGuide}>
            <Text style={styles.paymentGuideTitle}>Thông tin chuyển khoản</Text>
            <PaymentTransferCard bookingId={item.bookingId} paymentId={item.id} amount={item.amount} compact/>
            <TouchableOpacity style={styles.submitPaymentBtn} onPress={() => submitPayment(item.id)}>
              <Text style={styles.submitPaymentText}>Tôi đã chuyển khoản</Text>
            </TouchableOpacity>
          </View>) : null}
      </View>);
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thanh toán của tôi</Text>
      </View>

      <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { borderColor: colors.border }]}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Tìm mã thanh toán, booking, tour..." placeholderTextColor={colors.textMuted} value={searchKeyword} onChangeText={setSearchKeyword} returnKeyType="search"/>
            {searchKeyword.length > 0 ? (<TouchableOpacity onPress={clearSearch}>
                <Text style={{ fontSize: 16, color: COLORS.textMuted }}>✕</Text>
              </TouchableOpacity>) : null}
          </View>
          <TouchableOpacity style={[styles.filterToggleBtn, showDateFilter && styles.filterToggleBtnActive]} onPress={() => setShowDateFilter((current) => !current)} activeOpacity={0.85}>
            <Text style={styles.filterToggleText}>☰ Lọc</Text>
          </TouchableOpacity>
        </View>
        {showDateFilter ? (<View style={styles.dateFilterPanel}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Lọc theo ngày thanh toán</Text>
              {(filterDay || filterMonth || filterYear || appliedDateFilter.day || appliedDateFilter.month || appliedDateFilter.year) ? (<TouchableOpacity style={styles.clearFilterBtn} onPress={clearDateFilters}>
                  <Text style={styles.clearFilterText}>Xóa</Text>
                </TouchableOpacity>) : null}
            </View>
            <View style={styles.dateFilterRow}>
              <TextInput style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]} placeholder="Ngày" placeholderTextColor={colors.textMuted} value={filterDay} onChangeText={setFilterDay} keyboardType="numeric" maxLength={2}/>
              <TextInput style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]} placeholder="Tháng" placeholderTextColor={colors.textMuted} value={filterMonth} onChangeText={setFilterMonth} keyboardType="numeric" maxLength={2}/>
              <TextInput style={[styles.dateInput, styles.yearInput, { color: colors.text, borderColor: colors.border }]} placeholder="Năm" placeholderTextColor={colors.textMuted} value={filterYear} onChangeText={setFilterYear} keyboardType="numeric" maxLength={4}/>
              <TouchableOpacity style={styles.applyDateBtn} onPress={applyDateFilters} activeOpacity={0.85}>
                <Text style={styles.applyDateText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>) : null}
      </View>

      {loading ? (<ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }}/>) : (<FlatList data={filteredPayments} keyExtractor={(item) => item.id.toString()} renderItem={renderPaymentCard} contentContainerStyle={styles.listContent} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💸</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Không có giao dịch phù hợp</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Thử đổi ngày, tháng hoặc năm lọc</Text>
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
    filterPanel: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        gap: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    searchBox: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchIcon: {
        color: COLORS.textMuted,
        fontSize: 20,
        lineHeight: 22,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    filterToggleBtn: {
        height: 46,
        borderRadius: 14,
        paddingHorizontal: 13,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterToggleBtnActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    filterToggleText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '900',
    },
    dateFilterPanel: {
        borderRadius: 14,
        padding: 12,
        backgroundColor: COLORS.primaryLight,
        gap: 10,
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: '900',
    },
    clearFilterBtn: {
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearFilterText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    dateFilterRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dateInput: {
        flex: 1,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    yearInput: {
        flex: 1.25,
    },
    applyDateBtn: {
        height: 42,
        minWidth: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyDateText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
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
        alignItems: 'center',
        marginBottom: 12,
    },
    transactionId: {
        fontSize: 13,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardBody: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
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
        fontSize: 14,
        fontWeight: '600',
    },
    amountValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    paymentGuide: {
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        backgroundColor: COLORS.primaryLight,
        gap: 4,
    },
    paymentGuideTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 4,
    },
    paymentGuideText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '600',
    },
    submitPaymentBtn: {
        marginTop: 10,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitPaymentText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        marginTop: 4,
    },
});
