import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { providerService } from '../../api/services';
import { User } from '../../types';

type Props = {
  navigation: any;
  onLogout: () => void;
};

const COLORS = {
  primary: '#006c4b',
  primaryDark: '#004d38',
  primaryLight: '#e6f4ea',
  bg: '#f6f8fb',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f9',
  text: '#17201c',
  textMuted: '#64716b',
  border: '#d9e3df',
  success: '#0f7a4f',
  warning: '#9a5b00',
  warningLight: '#fff3d8',
  accent: '#0058bc',
  accentLight: '#e8f0fe',
  error: '#ba1a1a',
  errorLight: '#ffdad6',
};

const formatCurrency = (value: number | string | null | undefined) =>
  `${Number(value || 0).toLocaleString('vi-VN')}₫`;

export default function ProviderDashboardScreen({ navigation, onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getUserFromStorage = async () => {
    const userStorage = await AsyncStorage.getItem('user');
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, revRes] = await Promise.all([
        providerService.getProviderStats(),
        providerService.getProviderRevenueByMonth(),
      ]);
      setStats({
        ...statsRes.data.data,
        monthlyRevenue: revRes.data.data || [],
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lấy thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserFromStorage();
      fetchStats();
    });
    return unsubscribe;
  }, [navigation]);

  const initials = useMemo(() => {
    const source = user?.companyName || user?.fullName || 'P';
    return source.trim().charAt(0).toUpperCase();
  }, [user]);

  const recentRevenue = (stats?.monthlyRevenue || []).slice(-4).reverse();
  const providerName = user?.companyName || user?.fullName || 'Đối tác MixueVivu';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.navName} numberOfLines={1}>{providerName}</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleBadge}>Provider</Text>
              <Text style={styles.roleMeta} numberOfLines={1}>
                {user?.email || 'provider@mixuevivu.vn'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.82}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Bảng điều khiển đối tác</Text>
            <Text style={styles.heroTitle}>Theo dõi tour, booking và doanh thu trong một nơi.</Text>
            <Text style={styles.heroSubtitle}>
              Cập nhật tình hình kinh doanh, xử lý đơn đặt tour và chuẩn bị lịch trình cho các chuyến đi sắp tới.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('AddTourTab')}
            activeOpacity={0.86}
          >
            <Text style={styles.heroButtonText}>Đăng tour mới</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu dashboard...</Text>
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
                <Text style={styles.kpiLabelPrimary}>Tổng doanh thu</Text>
                <Text style={styles.kpiValuePrimary}>{formatCurrency(stats?.totalRevenue)}</Text>
                <Text style={styles.kpiHintPrimary}>Từ booking đã xác nhận/hoàn thành</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Tour đang quản lý</Text>
                <Text style={styles.kpiValue}>{stats?.totalTours || 0}</Text>
                <Text style={styles.kpiHint}>Danh mục sản phẩm</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Lượt đặt tour</Text>
                <Text style={styles.kpiValue}>{stats?.totalBookings || 0}</Text>
                <Text style={styles.kpiHint}>Tổng booking nhận được</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Đã đối soát</Text>
                <Text style={styles.kpiValue}>{formatCurrency(stats?.totalPaidOut)}</Text>
                <Text style={styles.kpiHint}>Khoản đã nhận</Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            </View>

            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('MyToursTab')}>
                <Text style={styles.quickTitle}>Quản lý tour</Text>
                <Text style={styles.quickDesc}>Cập nhật, gửi lại tour bị từ chối và chỉnh lịch trình.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ProviderBookingsTab')}>
                <Text style={styles.quickTitle}>Xử lý booking</Text>
                <Text style={styles.quickDesc}>Xác nhận, từ chối hoặc hoàn thành đơn đặt tour.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ProviderPayoutsTab')}>
                <Text style={styles.quickTitle}>Theo dõi payout</Text>
                <Text style={styles.quickDesc}>Xem khoản chờ đối soát và khoản đã thanh toán.</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Doanh thu gần đây</Text>
              <Text style={styles.sectionMeta}>{recentRevenue.length} tháng</Text>
            </View>

            <View style={styles.revenuePanel}>
              {recentRevenue.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Chưa có doanh thu</Text>
                  <Text style={styles.emptyText}>Khi booking được xác nhận, số liệu sẽ xuất hiện tại đây.</Text>
                </View>
              ) : (
                recentRevenue.map((row: any) => (
                  <View key={row.month} style={styles.revenueRow}>
                    <View>
                      <Text style={styles.revenueMonth}>{row.month}</Text>
                      <Text style={styles.revenueCount}>{row.count || 0} booking</Text>
                    </View>
                    <View style={styles.revenueValueBlock}>
                      <Text style={styles.revenueValue}>{formatCurrency(row.providerAmount)}</Text>
                      <Text style={styles.revenueSub}>sau hoa hồng</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topNav: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#b8dcc8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  identityText: {
    flex: 1,
  },
  navName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  roleBadge: {
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  roleMeta: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroCopy: {
    marginBottom: 18,
  },
  heroEyebrow: {
    color: '#cdebdc',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#e8f6ee',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  heroButton: {
    alignSelf: 'flex-start',
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  loadingBox: {
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  kpiCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 128,
    borderRadius: 18,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  kpiCardPrimary: {
    flexBasis: '100%',
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  kpiLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  kpiValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  kpiHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  kpiLabelPrimary: {
    color: '#ccebdc',
    fontSize: 13,
    fontWeight: '800',
  },
  kpiValuePrimary: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  kpiHintPrimary: {
    color: '#dff4e8',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionRow: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  quickGrid: {
    gap: 10,
  },
  quickCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
  },
  quickTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 5,
  },
  quickDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  revenuePanel: {
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  revenueRow: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  revenueMonth: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  revenueCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  revenueValueBlock: {
    alignItems: 'flex-end',
  },
  revenueValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  revenueSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  emptyState: {
    padding: 18,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
