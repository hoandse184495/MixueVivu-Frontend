import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { bookingService, payoutService } from '../../api/services';
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
  processing: { label: 'Đang xử lý', bg: COLORS.primaryLight, color: COLORS.primary, emoji: '...' },
  paid: { label: 'Đã thanh toán', bg: COLORS.successLight, color: COLORS.success, emoji: '✅' },
  not_created: { label: 'Chưa tạo đối soát', bg: COLORS.primaryLight, color: COLORS.primary, emoji: '...' },
};

const formatCurrency = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}₫`;

export default function ProviderPayoutsScreen() {
  const { colors } = useAppTheme();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      const [payoutRes, bookingRes] = await Promise.all([
        payoutService.getMyPayouts(),
        bookingService.getProviderBookings(),
      ]);
      setPayouts(payoutRes.data.data || []);
      setBookings(bookingRes.data.data || []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const revenueBookings = useMemo(() => {
    const payoutByBookingId = payouts.reduce<Record<string, any>>((acc, payout) => {
      acc[String(payout.bookingId)] = payout;
      return acc;
    }, {});

    return bookings
      .filter((booking) => ['confirmed', 'completed'].includes(booking.status))
      .map((booking) => ({
        ...booking,
        payout: payoutByBookingId[String(booking.id)],
      }));
  }, [bookings, payouts]);

  const revenueSummary = useMemo(
    () =>
      revenueBookings.reduce(
        (summary, booking) => ({
          totalRevenue: summary.totalRevenue + Number(booking.totalPrice || 0),
          totalCommission: summary.totalCommission + Number(booking.commissionAmount || 0),
        }),
        {
          totalRevenue: 0,
          totalCommission: 0,
        }
      ),
    [revenueBookings]
  );

  const renderSummaryCard = (
    label: string,
    value: number,
    tone: 'primary' | 'warning'
  ) => {
    const toneStyle = {
      primary: { bg: COLORS.primaryLight, color: COLORS.primary },
      warning: { bg: COLORS.warningLight, color: COLORS.warning },
    }[tone];

    return (
      <View style={[styles.summaryCard, { backgroundColor: toneStyle.bg }]}>
        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.summaryValue, { color: toneStyle.color }]}>
          {formatCurrency(value)}
        </Text>
      </View>
    );
  };

  const renderListHeader = () => (
    <View>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: COLORS.primary }]}>DOANH THU CỦA TÔI</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Theo dõi doanh thu provider</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
          Chỉ hiển thị doanh thu tour của bạn và phần hoa hồng hệ thống đã khấu trừ.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        {renderSummaryCard('Tổng doanh thu của tôi', revenueSummary.totalRevenue, 'primary')}
        {renderSummaryCard('Hoa hồng bị trừ', revenueSummary.totalCommission, 'warning')}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Phiếu doanh thu</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            {revenueBookings.length} booking có doanh thu của bạn
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPayoutCard = ({ item }: { item: any }) => {
    const payout = item.payout;
    const statusCfg = STATUS_CONFIG[payout?.status || 'not_created'] || STATUS_CONFIG.not_created;
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '35' }]}>
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
            <Text style={[styles.label, { color: colors.textMuted }]}>Mã Booking</Text>
            <Text style={[styles.value, { color: colors.text }]}>#{item.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Ngày tạo</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          {payout?.paidAt && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Ngày thanh toán</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {new Date(payout.paidAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Doanh thu</Text>
            <Text style={[styles.revenueValue, { color: colors.text }]}>
              {formatCurrency(Number(item.totalPrice || 0))}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Hoa hồng bị trừ</Text>
            <Text style={styles.commissionValue}>
              {formatCurrency(Number(item.commissionAmount || 0))}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Doanh thu</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={revenueBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPayoutCard}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchRevenueData}
          refreshing={loading}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>💰</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có doanh thu</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Khi booking phát sinh đối soát, doanh thu của bạn sẽ xuất hiện ở đây.
              </Text>
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
    flex: 1,
    minWidth: 150,
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
  commissionValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.warning,
    marginTop: 4,
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
