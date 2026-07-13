import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { payoutService } from '../../api/services';
import { useAppTheme } from '../../theme/ThemeContext';

const COLORS = {
  primary: '#006c4b',
  primaryLight: '#e6f4ea',
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
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; emoji: string }> = {
  pending: { label: 'Chờ thanh toán', bg: COLORS.warningLight, color: COLORS.warning, emoji: '⏳' },
  completed: { label: 'Đã thanh toán', bg: COLORS.successLight, color: COLORS.success, emoji: '✅' },
};

export default function ProviderPayoutsScreen() {
  const { colors } = useAppTheme();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await payoutService.getMyPayouts();
      setPayouts(res.data.data || []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải danh sách đối soát');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const renderPayoutCard = ({ item }: { item: any }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.payoutId, { color: colors.textMuted }]}>
            Phiếu #{item.id}
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
            <Text style={[styles.value, { color: colors.text }]}>#{item.bookingId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Ngày tạo:</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          {item.paidAt && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Ngày thanh toán:</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(item.paidAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.label, { color: colors.textMuted }]}>Tiền tour:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{Number(item.amount).toLocaleString('vi-VN')}₫</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Thực nhận</Text>
            <Text style={styles.amountValue}>
              {Number(item.providerAmount).toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lịch sử Đối soát</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={payouts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPayoutCard}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchPayouts}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💸</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có phiếu đối soát</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Bạn chưa có khoản thanh toán nào từ hệ thống</Text>
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
  payoutId: {
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
