import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminService, payoutService, notificationService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import ManagerNotificationModal from './ManagerNotificationModal';
const DASHBOARD_COLORS = {
    ink: '#111827',
    muted: '#6b7280',
    soft: '#9ca3af',
    line: '#d7dee8',
    panel: '#ffffff',
    panelMuted: '#f8fafc',
    canvas: '#f4f7fa',
    teal: '#0f766e',
    tealDark: '#115e59',
    tealSoft: '#dff4ef',
    blue: '#2563eb',
    blueSoft: '#e8efff',
    amber: '#b45309',
    amberSoft: '#fff7ed',
    violet: '#7c3aed',
    violetSoft: '#f1ecff',
    danger: '#ba1a1a',
};
const HERO_IMAGE = {
    uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
};
export default function ManagerDashboardScreen({ navigation, onLogout }) {
    const { colors } = useAppTheme();
    const { width } = useWindowDimensions();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const isWide = width >= 760;
    const getUserFromStorage = async () => {
        const userStorage = await AsyncStorage.getItem('user');
        if (userStorage) {
            setUser(JSON.parse(userStorage));
        }
    };
    const fetchDashboardStats = async () => {
        var _a, _b;
        try {
            setLoading(true);
            const [dashboardRes, payoutsRes] = await Promise.all([
                adminService.getDashboard(),
                payoutService.getAllPayouts(),
            ]);
            setStats(dashboardRes.data.data);
            setPayouts(payoutsRes.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể lấy thống kê dashboard');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchNotifications = async (showLoading = true) => {
        var _a, _b;
        try {
            if (showLoading)
                setNotificationLoading(true);
            const [notificationRes, unreadRes] = await Promise.all([
                notificationService.getAll(),
                notificationService.getUnreadCount(),
            ]);
            setNotifications(notificationRes.data.data || []);
            setUnreadCount(Number(((_a = unreadRes.data.data) === null || _a === void 0 ? void 0 : _a.count) || 0));
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data?.message) || 'Không thể tải thông báo');
        }
        finally {
            setNotificationLoading(false);
        }
    };
    const openNotifications = () => {
        setNotificationVisible(true);
        fetchNotifications();
    };
    const handleMarkAllAsRead = async () => {
        var _a;
        try {
            await notificationService.markAllAsRead();
            fetchNotifications(false);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data?.message) || 'Không thể đánh dấu đã đọc');
        }
    };
    const handleOpenNotification = async (item, targetTab) => {
        var _a;
        try {
            if (!item.isRead) {
                await notificationService.markAsRead(item.id);
                fetchNotifications(false);
            }
            setNotificationVisible(false);
            if (targetTab) {
                const tabNavigation = navigation.getParent ? navigation.getParent() : navigation;
                tabNavigation.navigate(targetTab);
            }
        }
        catch (error) {
            Alert.alert('Lỗi', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data?.message) || 'Không thể mở thông báo');
        }
    };
    const handleLogout = async () => {
        onLogout();
    };
    useEffect(() => {
        getUserFromStorage();
        fetchDashboardStats();
        fetchNotifications(false);
    }, []);
    const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');
    const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}₫`;
    const statCards = [
        {
            label: 'Người dùng',
            value: formatNumber(stats === null || stats === void 0 ? void 0 : stats.totalUsers),
            icon: '👥',
            accent: DASHBOARD_COLORS.blue,
            tone: DASHBOARD_COLORS.blueSoft,
            detail: 'Tài khoản khách hàng',
        },
        {
            label: 'Provider',
            value: formatNumber(stats === null || stats === void 0 ? void 0 : stats.totalProviders),
            icon: '🏢',
            accent: DASHBOARD_COLORS.teal,
            tone: DASHBOARD_COLORS.tealSoft,
            detail: 'Đối tác cung cấp tour',
        },
        {
            label: 'Tour',
            value: formatNumber(stats === null || stats === void 0 ? void 0 : stats.totalTours),
            icon: '🧭',
            accent: DASHBOARD_COLORS.violet,
            tone: DASHBOARD_COLORS.violetSoft,
            detail: 'Tổng tour trong hệ thống',
        },
        {
            label: 'Booking',
            value: formatNumber(stats === null || stats === void 0 ? void 0 : stats.totalBookings),
            icon: '🎫',
            accent: DASHBOARD_COLORS.amber,
            tone: DASHBOARD_COLORS.amberSoft,
            detail: 'Lượt đặt tour',
        },
    ];
    const financeCards = [
        {
            label: 'Tổng doanh thu',
            value: formatCurrency(stats === null || stats === void 0 ? void 0 : stats.totalRevenue),
            detail: 'Từ booking đã xác nhận hoặc hoàn thành',
            accent: DASHBOARD_COLORS.blue,
            tone: DASHBOARD_COLORS.blueSoft,
        },
        {
            label: 'Hoa hồng nền tảng',
            value: formatCurrency(stats === null || stats === void 0 ? void 0 : stats.totalCommission),
            detail: 'Phần doanh thu MixueVivu giữ lại',
            accent: DASHBOARD_COLORS.violet,
            tone: DASHBOARD_COLORS.violetSoft,
        },
        {
            label: 'Phải trả provider',
            value: formatCurrency(stats === null || stats === void 0 ? void 0 : stats.totalProviderAmount),
            detail: 'Tổng tiền cần đối soát cho đối tác',
            accent: DASHBOARD_COLORS.teal,
            tone: DASHBOARD_COLORS.tealSoft,
        },
    ];
    const providerFinanceRows = Object.values(payouts.reduce((acc, payout) => {
        const providerKey = String(payout.providerId || payout.providerEmail || payout.providerName || 'unknown');
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
        }
        else {
            row.pendingCount += 1;
            row.pendingAmount += providerAmount;
        }
        return acc;
    }, {})).sort((a, b) => b.totalProviderAmount - a.totalProviderAmount);
    const pendingPayouts = providerFinanceRows.reduce((sum, row) => sum + row.pendingCount, 0);
    const paidPayouts = providerFinanceRows.reduce((sum, row) => sum + row.paidCount, 0);
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardStats}/>}>
        <ImageBackground source={HERO_IMAGE} style={styles.headerHero} imageStyle={styles.headerHeroImage}>
          <View style={styles.headerOverlay}>
            <View style={styles.headerTopRow}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>MixueVivu Admin</Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.notificationButton} onPress={openNotifications} activeOpacity={0.85}>
                  <Text style={styles.notificationButtonText}>🔔</Text>
                  {unreadCount > 0 ? (<View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>) : null}
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={fetchDashboardStats} disabled={loading} activeOpacity={0.85}>
                  <Text style={styles.secondaryButtonText}>
                    {loading ? 'Đang tải' : 'Làm mới'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
                  <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerTextBlock}>
              <Text style={styles.eyebrow}>ADMIN CONSOLE</Text>
              <Text style={styles.title}>Tổng quan hệ thống</Text>
              <Text style={styles.subtitle}>
                Xin chào {(user === null || user === void 0 ? void 0 : user.fullName) || 'Manager'}, theo dõi vận hành, booking và đối soát của MixueVivu trong một màn hình.
              </Text>
            </View>

            <View style={styles.heroSummaryRow}>
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryValue}>{formatNumber(stats === null || stats === void 0 ? void 0 : stats.totalBookings)}</Text>
                <Text style={styles.heroSummaryLabel}>booking</Text>
              </View>
              <View style={styles.heroSummaryDivider}/>
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryValue}>{formatNumber(stats === null || stats === void 0 ? void 0 : stats.totalTours)}</Text>
                <Text style={styles.heroSummaryLabel}>tour</Text>
              </View>
              <View style={styles.heroSummaryDivider}/>
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryValue}>{formatNumber(pendingPayouts)}</Text>
                <Text style={styles.heroSummaryLabel}>chờ trả</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {loading && !stats ? (<View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary}/>
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải dữ liệu dashboard...</Text>
          </View>) : stats ? (<>
            <View style={[styles.kpiGrid, isWide && styles.kpiGridWide]}>
              {statCards.map((item) => (<View key={item.label} style={[
                    styles.kpiCard,
                    isWide && styles.kpiCardWide,
                    { borderColor: colors.border + '55' },
                ]}>
                  <View style={styles.kpiTopRow}>
                    <View style={[styles.kpiMark, { backgroundColor: item.tone }]}>
                      <Text style={styles.kpiIcon}>{item.icon}</Text>
                    </View>
                    <View style={[styles.kpiAccentLine, { backgroundColor: item.accent }]}/>
                  </View>
                  <Text style={styles.kpiLabel}>{item.label}</Text>
                  <Text style={styles.kpiValue}>{item.value}</Text>
                  <Text style={styles.kpiDetail}>{item.detail}</Text>
                </View>))}
            </View>

            <View style={[styles.financeGrid, isWide && styles.financeGridWide]}>
              {financeCards.map((item) => (<View key={item.label} style={[styles.financeCard, isWide && styles.financeCardWide]}>
                  <View style={[styles.financeMarker, { backgroundColor: item.tone }]}>
                    <View style={[styles.financeMarkerDot, { backgroundColor: item.accent }]}/>
                  </View>
                  <Text style={styles.financeLabel}>{item.label}</Text>
                  <Text style={styles.financeValue}>{item.value}</Text>
                  <Text style={styles.financeDetail}>{item.detail}</Text>
                </View>))}
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
                    {providerFinanceRows.length} provider · {paidPayouts} đã trả
                  </Text>
                </View>
              </View>

              {providerFinanceRows.length === 0 ? (<View style={styles.providerEmpty}>
                  <Text style={styles.providerEmptyTitle}>
                    Chưa có phiếu đối soát
                  </Text>
                  <Text style={styles.providerEmptyText}>
                    Khi booking hoàn thành và phát sinh payout, tài chính từng provider sẽ hiện ở đây.
                  </Text>
                </View>) : (<View style={styles.providerFinanceList}>
                  {providerFinanceRows.map((row) => (<View key={row.providerId || row.providerEmail || row.providerName} style={styles.providerFinanceCard}>
                      <View style={styles.providerFinanceHeader}>
                        <View style={styles.providerIdentity}>
                          <Text style={styles.providerName} numberOfLines={1}>
                            {row.providerName}
                          </Text>
                          {row.providerEmail ? (<Text style={styles.providerEmail} numberOfLines={1}>
                              {row.providerEmail}
                            </Text>) : null}
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
                        <Text style={[
                        styles.providerStatusTextStrong,
                        { color: row.pendingAmount > 0 ? '#b25e00' : '#006c4b' },
                    ]}>
                          Chờ trả: {formatCurrency(row.pendingAmount)} ({row.pendingCount})
                        </Text>
                      </View>
                    </View>))}
                </View>)}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trọng tâm vận hành</Text>
              <Text style={styles.sectionSubtitle}>
                Tour chờ duyệt, booking, thanh toán và người dùng đang là các nhóm dữ liệu chính của hệ thống.
              </Text>
            </View>
          </>) : (<View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border + '55' }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có dữ liệu dashboard</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={fetchDashboardStats} activeOpacity={0.85}>
              <Text style={styles.logoutButtonText}>Tải lại</Text>
            </TouchableOpacity>
          </View>)}
      </ScrollView>
      <ManagerNotificationModal visible={notificationVisible} notifications={notifications} unreadCount={unreadCount} loading={notificationLoading} onClose={() => setNotificationVisible(false)} onRetry={() => fetchNotifications()} onMarkAllAsRead={handleMarkAllAsRead} onOpenNotification={handleOpenNotification}/>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DASHBOARD_COLORS.canvas,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 36,
    },
    headerHero: {
        minHeight: 248,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: DASHBOARD_COLORS.teal,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
    },
    headerHeroImage: {
        borderRadius: 18,
    },
    headerOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 18,
        backgroundColor: 'rgba(6, 34, 39, 0.52)',
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
    },
    adminBadge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    adminBadgeText: {
        color: DASHBOARD_COLORS.tealDark,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    headerTextBlock: {
        flex: 1,
        maxWidth: 680,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0,
        marginBottom: 6,
        color: '#dff4ef',
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        lineHeight: 36,
        color: '#ffffff',
        textShadowColor: 'rgba(0,0,0,0.24)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 21,
        color: '#f8fafc',
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.64)',
        backgroundColor: 'rgba(255,255,255,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationButtonText: {
        fontSize: 17,
    },
    notificationBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        backgroundColor: DASHBOARD_COLORS.danger,
        borderWidth: 1,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '900',
    },
    secondaryButton: {
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.64)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: '800',
        color: DASHBOARD_COLORS.tealDark,
    },
    logoutButton: {
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: DASHBOARD_COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '800',
    },
    heroSummaryRow: {
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
    },
    heroSummaryItem: {
        minWidth: 76,
        alignItems: 'center',
    },
    heroSummaryValue: {
        color: DASHBOARD_COLORS.ink,
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '900',
    },
    heroSummaryLabel: {
        marginTop: 1,
        color: DASHBOARD_COLORS.muted,
        fontSize: 11,
        fontWeight: '800',
    },
    heroSummaryDivider: {
        width: 1,
        height: 30,
        backgroundColor: DASHBOARD_COLORS.line,
        marginHorizontal: 6,
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
        marginBottom: 16,
    },
    kpiGridWide: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    kpiCard: {
        backgroundColor: DASHBOARD_COLORS.panel,
        borderRadius: 14,
        padding: 15,
        borderWidth: 1,
        borderColor: DASHBOARD_COLORS.line + '80',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
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
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    kpiIcon: {
        fontSize: 18,
    },
    kpiAccentLine: {
        width: 36,
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
        marginBottom: 16,
    },
    financeGridWide: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    financeCard: {
        backgroundColor: DASHBOARD_COLORS.panel,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: DASHBOARD_COLORS.line + '80',
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 3 },
    },
    financeCardWide: {
        flexBasis: '31%',
        flexGrow: 1,
    },
    financeMarker: {
        width: 30,
        height: 30,
        borderRadius: 10,
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
        marginBottom: 16,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: DASHBOARD_COLORS.line + '80',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 9,
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
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: DASHBOARD_COLORS.tealSoft,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: DASHBOARD_COLORS.tealDark,
    },
    providerFinanceList: {
        gap: 12,
    },
    providerFinanceCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: DASHBOARD_COLORS.line + '80',
        padding: 14,
        backgroundColor: DASHBOARD_COLORS.panelMuted,
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
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: DASHBOARD_COLORS.tealSoft,
    },
    providerBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: DASHBOARD_COLORS.tealDark,
    },
    providerMetricGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    providerMetric: {
        flex: 1,
        minWidth: 120,
        borderRadius: 12,
        padding: 10,
        backgroundColor: DASHBOARD_COLORS.panel,
        borderWidth: 1,
        borderColor: DASHBOARD_COLORS.line + '55',
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
        borderRadius: 14,
        padding: 16,
        backgroundColor: DASHBOARD_COLORS.panelMuted,
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
        borderRadius: 14,
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
