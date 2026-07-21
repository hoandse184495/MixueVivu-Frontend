import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminService, payoutService } from '../../api/services';
import { useAppTheme } from '../../theme/ThemeContext';
import { User } from '../../types';

type Props = {
  onLogout: () => void;
};

export default function ManagerDashboardScreen({ onLogout }: Props) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isWide = width >= 760;

  const getUserFromStorage = async () => {
    const userStorage = await AsyncStorage.getItem('user');
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [dashboardRes, payoutsRes] = await Promise.all([
        adminService.getDashboard(),
        payoutService.getAllPayouts(),
      ]);
      setStats(dashboardRes.data.data);
      setPayouts(payoutsRes.data.data || []);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể lấy thống kê dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    onLogout();
  };

  useEffect(() => {
    getUserFromStorage();
    fetchDashboardStats();
  }, []);

  const formatNumber = (value: number | string | null | undefined) =>
    Number(value || 0).toLocaleString('vi-VN');

  const formatCurrency = (value: number | string | null | undefined) =>
    `${Number(value || 0).toLocaleString('vi-VN')}₫`;

  const statCards = [
    {
      label: 'Người dùng',
      value: formatNumber(stats?.totalUsers),
      accent: '#0058bc',
      tone: '#e8f0fe',
      detail: 'Tài khoản khách hàng',
    },
    {
      label: 'Provider',
      value: formatNumber(stats?.totalProviders),
      accent: '#006c4b',
      tone: '#e6f4ea',
      detail: 'Đối tác cung cấp tour',
    },
    {
      label: 'Tour',
      value: formatNumber(stats?.totalTours),
      accent: '#7c3aed',
      tone: '#f0ebff',
      detail: 'Tổng tour trong hệ thống',
    },
    {
      label: 'Booking',
      value: formatNumber(stats?.totalBookings),
      accent: '#b25e00',
      tone: '#fff4e5',
      detail: 'Lượt đặt tour',
    },
  ];

  const providerFinanceRows = Object.values(
    payouts.reduce((acc, payout) => {
      const providerKey = String(
        payout.providerId || payout.providerEmail || payout.providerName || 'unknown'
      );

      if (!acc[providerKey]) {
        acc[providerKey] = {
          providerId: payout.providerId,
          providerName: payout.providerName || 'Nhà cung cấp',
          providerEmail: payout.providerEmail,
          payoutCount: 0,
          paidCount: 0,
          pendingCount: 0,
          totalRevenue: 0,
          totalCommission: 0,
          totalProviderAmount: 0,
          paidOut: 0,
          pendingAmount: 0,
        };
      }

      const row = acc[providerKey];
      const providerAmount = Number(payout.providerAmount || 0);
      row.payoutCount += 1;
      row.totalRevenue += Number(payout.amount || 0);
      row.totalCommission += Number(payout.commissionAmount || 0);
      row.totalProviderAmount += providerAmount;

      if (payout.status === 'paid') {
        row.paidCount += 1;
        row.paidOut += providerAmount;
      } else {
        row.pendingCount += 1;
        row.pendingAmount += providerAmount;
      }

      return acc;
    }, {} as Record<string, any>)
  ).sort((a: any, b: any) => b.totalProviderAmount - a.totalProviderAmount);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDashboardStats} />
        }
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTextBlock}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>ADMIN CONSOLE</Text>
            <Text style={[styles.title, { color: colors.text }]}>Tổng quan hệ thống</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Xin chào {user?.fullName || 'Manager'}, theo dõi vận hành và doanh thu của MixueVivu.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={fetchDashboardStats}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                {loading ? 'Đang tải' : 'Làm mới'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && !stats ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải dữ liệu dashboard...</Text>
          </View>
        ) : stats ? (
          <>
            <View style={[styles.kpiGrid, isWide && styles.kpiGridWide]}>
              {statCards.map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.kpiCard,
                    isWide && styles.kpiCardWide,
                    { backgroundColor: colors.surface, borderColor: colors.border + '55' },
                  ]}
                >
                  <View style={[styles.kpiMark, { backgroundColor: item.tone }]}>
                    <View style={[styles.kpiMarkDot, { backgroundColor: item.accent }]} />
                  </View>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{item.label}</Text>
                  <Text style={[styles.kpiValue, { color: colors.text }]}>{item.value}</Text>
                  <Text style={[styles.kpiDetail, { color: colors.textMuted }]}>{item.detail}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border + '55' }]}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Tài chính theo nhà cung cấp</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                    Dữ liệu lấy từ bảng Payouts, gom theo từng provider.
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
                    {providerFinanceRows.length} provider
                  </Text>
                </View>
              </View>

              {providerFinanceRows.length === 0 ? (
                <View style={[styles.providerEmpty, { backgroundColor: colors.surfaceContainerLow }]}>
                  <Text style={[styles.providerEmptyTitle, { color: colors.text }]}>
                    Chưa có phiếu đối soát
                  </Text>
                  <Text style={[styles.providerEmptyText, { color: colors.textMuted }]}>
                    Khi booking hoàn thành và phát sinh payout, tài chính từng provider sẽ hiện ở đây.
                  </Text>
                </View>
              ) : (
                <View style={styles.providerFinanceList}>
                  {providerFinanceRows.map((row: any) => (
                    <View
                      key={row.providerId || row.providerEmail || row.providerName}
                      style={[styles.providerFinanceCard, { borderColor: colors.border + '55' }]}
                    >
                      <View style={styles.providerFinanceHeader}>
                        <View style={styles.providerIdentity}>
                          <Text style={[styles.providerName, { color: colors.text }]} numberOfLines={1}>
                            {row.providerName}
                          </Text>
                          {row.providerEmail ? (
                            <Text style={[styles.providerEmail, { color: colors.textMuted }]} numberOfLines={1}>
                              {row.providerEmail}
                            </Text>
                          ) : null}
                        </View>
                        <View style={[styles.providerBadge, { backgroundColor: colors.surfaceContainerLow }]}>
                          <Text style={[styles.providerBadgeText, { color: colors.textMuted }]}>
                            {row.payoutCount} phiếu
                          </Text>
                        </View>
                      </View>

                      <View style={styles.providerMetricGrid}>
                        <View style={styles.providerMetric}>
                          <Text style={[styles.providerMetricLabel, { color: colors.textMuted }]}>Doanh thu</Text>
                          <Text style={[styles.providerMetricValue, { color: colors.text }]}>
                            {formatCurrency(row.totalRevenue)}
                          </Text>
                        </View>
                        <View style={styles.providerMetric}>
                          <Text style={[styles.providerMetricLabel, { color: colors.textMuted }]}>Hoa hồng</Text>
                          <Text style={[styles.providerMetricValue, { color: colors.text }]}>
                            {formatCurrency(row.totalCommission)}
                          </Text>
                        </View>
                        <View style={styles.providerMetric}>
                          <Text style={[styles.providerMetricLabel, { color: colors.textMuted }]}>Phải trả</Text>
                          <Text style={[styles.providerMetricValue, { color: colors.text }]}>
                            {formatCurrency(row.totalProviderAmount)}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.providerStatusRow, { borderTopColor: colors.border + '45' }]}>
                        <Text style={[styles.providerStatusText, { color: colors.textMuted }]}>
                          Đã trả: {formatCurrency(row.paidOut)} ({row.paidCount})
                        </Text>
                        <Text
                          style={[
                            styles.providerStatusTextStrong,
                            { color: row.pendingAmount > 0 ? '#b25e00' : '#006c4b' },
                          ]}
                        >
                          Chờ trả: {formatCurrency(row.pendingAmount)} ({row.pendingCount})
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border + '55' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trọng tâm vận hành</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Tour chờ duyệt, booking, thanh toán và người dùng đang là các nhóm dữ liệu chính của hệ thống.
              </Text>
            </View>
          </>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border + '55' }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có dữ liệu dashboard</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={fetchDashboardStats} activeOpacity={0.85}>
              <Text style={styles.logoutButtonText}>Tải lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 34,
  },
  header: {
    borderRadius: 8,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
    borderWidth: 1,
    borderColor: '#dfe5ef',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  headerTextBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 620,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  secondaryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  logoutButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  loadingCard: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  kpiGrid: {
    gap: 12,
  },
  kpiGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kpiCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  kpiCardWide: {
    flexBasis: '23.5%',
    flexGrow: 1,
  },
  kpiMark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  kpiMarkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  kpiValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  kpiDetail: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  section: {
    marginTop: 14,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  providerFinanceList: {
    gap: 12,
  },
  providerFinanceCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  providerFinanceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  providerIdentity: {
    flex: 1,
    minWidth: 0,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '800',
  },
  providerEmail: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
  },
  providerBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  providerMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  providerMetric: {
    flex: 1,
    minWidth: 120,
  },
  providerMetricLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  providerMetricValue: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  providerStatusRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  providerStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  providerStatusTextStrong: {
    fontSize: 12,
    fontWeight: '800',
  },
  providerEmpty: {
    borderRadius: 8,
    padding: 16,
  },
  providerEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  providerEmptyText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  emptyCard: {
    borderRadius: 8,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    gap: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
});
