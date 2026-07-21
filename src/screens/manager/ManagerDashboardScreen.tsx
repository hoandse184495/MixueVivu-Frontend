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

const DASHBOARD_COLORS = {
  ink: '#0f172a',
  muted: '#64748b',
  line: '#d9e2ec',
  panel: '#ffffff',
  canvas: '#f5f7fb',
  blue: '#0058bc',
  blueSoft: '#e8f0fe',
  teal: '#00796b',
  tealSoft: '#e0f2ef',
  amber: '#b45309',
  amberSoft: '#fff7ed',
  violet: '#6d28d9',
  violetSoft: '#f3efff',
  danger: '#ba1a1a',
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
      icon: '👥',
      accent: DASHBOARD_COLORS.blue,
      tone: DASHBOARD_COLORS.blueSoft,
      detail: 'Tài khoản khách hàng',
    },
    {
      label: 'Provider',
      value: formatNumber(stats?.totalProviders),
      icon: '🏢',
      accent: DASHBOARD_COLORS.teal,
      tone: DASHBOARD_COLORS.tealSoft,
      detail: 'Đối tác cung cấp tour',
    },
    {
      label: 'Tour',
      value: formatNumber(stats?.totalTours),
      icon: '🧭',
      accent: DASHBOARD_COLORS.violet,
      tone: DASHBOARD_COLORS.violetSoft,
      detail: 'Tổng tour trong hệ thống',
    },
    {
      label: 'Booking',
      value: formatNumber(stats?.totalBookings),
      icon: '🎫',
      accent: DASHBOARD_COLORS.amber,
      tone: DASHBOARD_COLORS.amberSoft,
      detail: 'Lượt đặt tour',
    },
  ];

  const financeCards = [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(stats?.totalRevenue),
      detail: 'Từ booking đã xác nhận hoặc hoàn thành',
      accent: DASHBOARD_COLORS.blue,
      tone: DASHBOARD_COLORS.blueSoft,
    },
    {
      label: 'Hoa hồng nền tảng',
      value: formatCurrency(stats?.totalCommission),
      detail: 'Phần doanh thu MixueVivu giữ lại',
      accent: DASHBOARD_COLORS.violet,
      tone: DASHBOARD_COLORS.violetSoft,
    },
    {
      label: 'Phải trả provider',
      value: formatCurrency(stats?.totalProviderAmount),
      detail: 'Tổng tiền cần đối soát cho đối tác',
      accent: DASHBOARD_COLORS.teal,
      tone: DASHBOARD_COLORS.tealSoft,
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
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.eyebrow}>ADMIN CONSOLE</Text>
            <Text style={styles.title}>Tổng quan hệ thống</Text>
            <Text style={styles.subtitle}>
              Xin chào {user?.fullName || 'Manager'}, theo dõi vận hành và doanh thu của MixueVivu.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={fetchDashboardStats}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>
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
                    { borderColor: colors.border + '55' },
                  ]}
                >
                  <View style={styles.kpiTopRow}>
                    <View style={[styles.kpiMark, { backgroundColor: item.tone }]}>
                      <Text style={styles.kpiIcon}>{item.icon}</Text>
                    </View>
                    <View style={[styles.kpiAccentLine, { backgroundColor: item.accent }]} />
                  </View>
                  <Text style={styles.kpiLabel}>{item.label}</Text>
                  <Text style={styles.kpiValue}>{item.value}</Text>
                  <Text style={styles.kpiDetail}>{item.detail}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.financeGrid, isWide && styles.financeGridWide]}>
              {financeCards.map((item) => (
                <View key={item.label} style={[styles.financeCard, isWide && styles.financeCardWide]}>
                  <View style={[styles.financeMarker, { backgroundColor: item.tone }]}>
                    <View style={[styles.financeMarkerDot, { backgroundColor: item.accent }]} />
                  </View>
                  <Text style={styles.financeLabel}>{item.label}</Text>
                  <Text style={styles.financeValue}>{item.value}</Text>
                  <Text style={styles.financeDetail}>{item.detail}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Tài chính theo nhà cung cấp</Text>
                  <Text style={styles.sectionSubtitle}>
                    Theo dõi đối soát, số phiếu đã trả và phần còn chờ xử lý.
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {providerFinanceRows.length} provider
                  </Text>
                </View>
              </View>

              {providerFinanceRows.length === 0 ? (
                <View style={styles.providerEmpty}>
                  <Text style={styles.providerEmptyTitle}>
                    Chưa có phiếu đối soát
                  </Text>
                  <Text style={styles.providerEmptyText}>
                    Khi booking hoàn thành và phát sinh payout, tài chính từng provider sẽ hiện ở đây.
                  </Text>
                </View>
              ) : (
                <View style={styles.providerFinanceList}>
                  {providerFinanceRows.map((row: any) => (
                    <View
                      key={row.providerId || row.providerEmail || row.providerName}
                      style={styles.providerFinanceCard}
                    >
                      <View style={styles.providerFinanceHeader}>
                        <View style={styles.providerIdentity}>
                          <Text style={styles.providerName} numberOfLines={1}>
                            {row.providerName}
                          </Text>
                          {row.providerEmail ? (
                            <Text style={styles.providerEmail} numberOfLines={1}>
                              {row.providerEmail}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.providerBadge}>
                          <Text style={styles.providerBadgeText}>
                            {row.payoutCount} phiếu
                          </Text>
                        </View>
                      </View>

                      <View style={styles.providerMetricGrid}>
                        <View style={styles.providerMetric}>
                          <Text style={styles.providerMetricLabel}>Doanh thu</Text>
                          <Text style={styles.providerMetricValue}>
                            {formatCurrency(row.totalRevenue)}
                          </Text>
                        </View>
                        <View style={styles.providerMetric}>
                          <Text style={styles.providerMetricLabel}>Hoa hồng</Text>
                          <Text style={styles.providerMetricValue}>
                            {formatCurrency(row.totalCommission)}
                          </Text>
                        </View>
                        <View style={styles.providerMetric}>
                          <Text style={styles.providerMetricLabel}>Phải trả</Text>
                          <Text style={styles.providerMetricValue}>
                            {formatCurrency(row.totalProviderAmount)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.providerStatusRow}>
                        <Text style={styles.providerStatusText}>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trọng tâm vận hành</Text>
              <Text style={styles.sectionSubtitle}>
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
    backgroundColor: DASHBOARD_COLORS.canvas,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 36,
  },
  header: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.line,
    backgroundColor: DASHBOARD_COLORS.panel,
    elevation: 1,
    shadowColor: DASHBOARD_COLORS.ink,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerTextBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 6,
    color: DASHBOARD_COLORS.blue,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    color: DASHBOARD_COLORS.ink,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 620,
    color: DASHBOARD_COLORS.muted,
    fontWeight: '600',
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
    borderColor: DASHBOARD_COLORS.line,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: DASHBOARD_COLORS.ink,
  },
  logoutButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: DASHBOARD_COLORS.danger,
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
    marginBottom: 14,
  },
  kpiGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kpiCard: {
    backgroundColor: DASHBOARD_COLORS.panel,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.line,
    elevation: 1,
    shadowColor: DASHBOARD_COLORS.ink,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  kpiCardWide: {
    flexBasis: '23.5%',
    flexGrow: 1,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  kpiMark: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIcon: {
    fontSize: 18,
  },
  kpiAccentLine: {
    width: 34,
    height: 3,
    borderRadius: 2,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: DASHBOARD_COLORS.muted,
  },
  kpiValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    color: DASHBOARD_COLORS.ink,
  },
  kpiDetail: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    color: DASHBOARD_COLORS.muted,
  },
  financeGrid: {
    gap: 12,
    marginBottom: 14,
  },
  financeGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  financeCard: {
    backgroundColor: DASHBOARD_COLORS.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.line,
    padding: 16,
  },
  financeCardWide: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  financeMarker: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  financeMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  financeLabel: {
    color: DASHBOARD_COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  financeValue: {
    marginTop: 6,
    color: DASHBOARD_COLORS.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  financeDetail: {
    marginTop: 6,
    color: DASHBOARD_COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  section: {
    backgroundColor: DASHBOARD_COLORS.panel,
    marginTop: 0,
    marginBottom: 14,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.line,
    elevation: 1,
    shadowColor: DASHBOARD_COLORS.ink,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
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
    fontWeight: '900',
    color: DASHBOARD_COLORS.ink,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: DASHBOARD_COLORS.muted,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: DASHBOARD_COLORS.blueSoft,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: DASHBOARD_COLORS.blue,
  },
  providerFinanceList: {
    gap: 12,
  },
  providerFinanceCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DASHBOARD_COLORS.line,
    padding: 14,
    backgroundColor: '#fbfdff',
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
    fontWeight: '900',
    color: DASHBOARD_COLORS.ink,
  },
  providerEmail: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: DASHBOARD_COLORS.muted,
  },
  providerBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eef2f7',
  },
  providerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: DASHBOARD_COLORS.muted,
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
    color: DASHBOARD_COLORS.muted,
  },
  providerMetricValue: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
    color: DASHBOARD_COLORS.ink,
  },
  providerStatusRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5ebf2',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  providerStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: DASHBOARD_COLORS.muted,
  },
  providerStatusTextStrong: {
    fontSize: 12,
    fontWeight: '800',
  },
  providerEmpty: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  providerEmptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
    color: DASHBOARD_COLORS.ink,
  },
  providerEmptyText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    color: DASHBOARD_COLORS.muted,
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
