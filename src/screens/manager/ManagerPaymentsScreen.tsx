import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { paymentService } from '../../api/services';
import { useAppTheme } from '../../theme/ThemeContext';

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

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; emoji: string }> = {
  pending: { label: 'Chờ xử lý', bg: COLORS.warningLight, color: COLORS.warning, emoji: '⏳' },
  paid: { label: 'Đã thanh toán', bg: COLORS.successLight, color: COLORS.success, emoji: '✅' },
  refunded: { label: 'Đã hoàn tiền', bg: COLORS.errorLight, color: COLORS.error, emoji: '💵' },
  failed: { label: 'Thất bại', bg: COLORS.errorLight, color: COLORS.error, emoji: '!' },
};

export default function ManagerPaymentsScreen() {
  const { colors } = useAppTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAllPayments();
      setPayments(res.data.data || []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleConfirm = (id: number) => {
    Alert.alert(
      'Xác nhận thanh toán',
      'Bạn đã nhận đủ tiền cho giao dịch này?',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Đã nhận',
          onPress: async () => {
            try {
              await paymentService.confirmPayment(id);
              Alert.alert('Thành công', 'Đã xác nhận thanh toán.');
              fetchPayments();
            } catch (error: any) {
              Alert.alert(
                'Lỗi',
                error.response?.data?.message || 'Không thể xác nhận thanh toán'
              );
            }
          },
        },
      ]
    );
  };

  const handleRefund = (id: number) => {
    Alert.alert(
      'Xác nhận hoàn tiền',
      'Bạn có chắc chắn muốn hoàn tiền cho giao dịch này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn tiền',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.refundPayment(id);
              Alert.alert('Thành công', 'Đã hoàn tiền.');
              fetchPayments();
            } catch (error: any) {
              Alert.alert(
                'Lỗi',
                error.response?.data?.message || 'Không thể hoàn tiền'
              );
            }
          },
        },
      ]
    );
  };

  const renderPaymentCard = ({ item }: { item: any }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
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
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Phương thức:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.method === 'bank_transfer' ? 'Chuyển khoản' : item.method}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Số tiền</Text>
          <Text style={styles.amountValue}>
            {Number(item.amount).toLocaleString('vi-VN')}₫
          </Text>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => handleConfirm(item.id)}
            >
              <Text style={styles.confirmBtnText}>Xác nhận đã nhận tiền</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'paid' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.refundBtn}
              onPress={() => handleRefund(item.id)}
            >
              <Text style={styles.refundBtnText}>Hoàn tiền</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quản lý Thanh toán</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPaymentCard}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchPayments}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💸</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có giao dịch nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
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
