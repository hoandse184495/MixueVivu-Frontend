import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { paymentService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import { formatBookingCode, formatPaymentCode } from '../../utils/bookingDisplay';
import SearchBox from '../../components/common/SearchBox';
import ReasonModal from '../../components/common/ReasonModal';
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
export default function ManagerPaymentsScreen() {
    const { colors } = useAppTheme();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refundingPayment, setRefundingPayment] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [search, setSearch] = useState('');
    const fetchPayments = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const res = await paymentService.getAllPayments();
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
    }, [fetchPayments]);
    const handleConfirm = (id) => {
        Alert.alert('Xác nhận thanh toán', 'Bạn đã nhận đủ tiền cho giao dịch này?', [
            { text: 'Chưa', style: 'cancel' },
            {
                text: 'Đã nhận',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await paymentService.confirmPayment(id);
                        Alert.alert('Thành công', 'Đã xác nhận thanh toán.');
                        fetchPayments();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể xác nhận thanh toán');
                    }
                },
            },
        ]);
    };
    const handleRefund = (item, reason) => {
        Alert.alert('Xác nhận hoàn tiền', 'Bạn có chắc chắn muốn hoàn tiền giao dịch này không? Hệ thống chỉ đổi trạng thái thanh toán, không hủy booking và không hoàn slot.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Hoàn tiền',
                style: 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await paymentService.refundPayment(item.id, { note: reason });
                        Alert.alert('Thành công', 'Đã hoàn tiền.');
                        setRefundingPayment(null);
                        setRefundReason('');
                        fetchPayments();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể hoàn tiền');
                    }
                },
            },
        ]);
    };
    const openRefundModal = (item) => {
        setRefundingPayment(item);
        setRefundReason('');
    };
    const submitRefund = () => {
        if (!refundingPayment)
            return;
        if (!refundReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do hoàn tiền');
            return;
        }
        handleRefund(refundingPayment, refundReason.trim());
    };
    const renderPaymentCard = ({ item }) => {
        const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const canRefund = item.status === 'paid' && item.bookingStatus === 'cancelled';
        return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.transactionId, { color: colors.textMuted }]}>
            Giao dịch #{item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.emoji} {statusCfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Người dùng:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.userFullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Mã Booking:</Text>
            <Text style={[styles.value, { color: colors.text }]}>#{item.bookingId}</Text>
          </View>
          {item.bookingStatus ? (<View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Trạng thái booking:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{item.bookingStatus}</Text>
            </View>) : null}
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Phương thức:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.method === 'bank_transfer' ? 'Chuyển khoản' : item.method}</Text>
          </View>
        </View>

        <View style={styles.cardDivider}/>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Số tiền</Text>
          <Text style={styles.amountValue}>
            {Number(item.amount).toLocaleString('vi-VN')}₫
          </Text>
        </View>

        {item.status === 'pending' ? (<View style={styles.pendingInfoBox}>
            <Text style={styles.pendingInfoText}>
              Đang chờ khách chuyển khoản và bấm xác nhận đã chuyển.
            </Text>
          </View>) : null}

        {item.status === 'submitted' && (<View style={styles.actionRow}>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(item.id)}>
              <Text style={styles.confirmBtnText}>Xác nhận đã nhận tiền</Text>
            </TouchableOpacity>
          </View>)}

        {canRefund && (<View style={styles.actionRow}>
            <TouchableOpacity style={styles.refundBtn} onPress={() => openRefundModal(item)}>
              <Text style={styles.refundBtnText}>Hoàn tiền</Text>
            </TouchableOpacity>
          </View>)}
      </View>);
    };
    const filteredPayments = payments.filter((payment) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword)
            return true;
        return [
            formatPaymentCode(payment.id),
            formatBookingCode(payment.bookingId),
            payment.userFullName,
            payment.userEmail,
            payment.tourTitle,
            payment.status,
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));
    });
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quản lý Thanh toán</Text>
      </View>
      <SearchBox value={search} onChangeText={setSearch} placeholder="Tìm payment, booking, user, tour..." borderColor={colors.border} textColor={colors.text} mutedColor={colors.textMuted} backgroundColor={colors.surface}/>

      {loading ? (<ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }}/>) : (<FlatList data={filteredPayments} keyExtractor={(item) => item.id.toString()} renderItem={renderPaymentCard} contentContainerStyle={styles.listContent} onRefresh={fetchPayments} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💸</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có giao dịch nào</Text>
            </View>}/>)}

      <ReasonModal visible={refundingPayment !== null} title="Lý do hoàn tiền" placeholder="Ví dụ: Khách chuyển nhầm, booking bị hủy..." value={refundReason} submitLabel="Hoàn tiền" onChangeText={setRefundReason} onCancel={() => setRefundingPayment(null)} onSubmit={submitRefund}/>
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
    actionRow: {
        marginTop: 12,
        alignItems: 'flex-end',
    },
    pendingInfoBox: {
        marginTop: 12,
        borderRadius: 10,
        backgroundColor: COLORS.warningLight,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    pendingInfoText: {
        color: COLORS.warning,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    confirmBtn: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    confirmBtnText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    refundBtn: {
        backgroundColor: COLORS.errorLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    refundBtnText: {
        color: COLORS.error,
        fontWeight: '600',
        fontSize: 13,
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
});
