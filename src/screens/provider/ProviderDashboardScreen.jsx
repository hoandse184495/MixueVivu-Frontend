import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { providerService } from '../../services';
const COLORS = {
    primary: '#006c4b',
    primaryDark: '#115e59',
    primaryLight: '#dff4ef',
    bg: '#f4f7fa',
    surface: '#ffffff',
    surfaceMuted: '#f8fafc',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#d7dee8',
    success: '#047857',
    warning: '#b45309',
    warningLight: '#fff3d8',
    accent: '#2563eb',
    accentLight: '#e8efff',
    error: '#ba1a1a',
    errorLight: '#ffdad6',
};
const HERO_IMAGE = {
    uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
};
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}₫`;
export default function ProviderDashboardScreen({ navigation, onLogout }) {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const getUserFromStorage = async () => {
        const userStorage = await AsyncStorage.getItem('user');
        if (userStorage) {
            setUser(JSON.parse(userStorage));
        }
    };
    const fetchStats = async () => {
        var _a, _b;
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
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể lấy thống kê');
        }
        finally {
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
        const source = (user === null || user === void 0 ? void 0 : user.companyName) || (user === null || user === void 0 ? void 0 : user.fullName) || 'P';
        return source.trim().charAt(0).toUpperCase();
    }, [user]);
    const recentRevenue = ((stats === null || stats === void 0 ? void 0 : stats.monthlyRevenue) || []).slice(-4).reverse();
    const providerName = (user === null || user === void 0 ? void 0 : user.companyName) || (user === null || user === void 0 ? void 0 : user.fullName) || 'Đối tác MixueVivu';
    return (<SafeAreaView style={styles.container}>
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
                {(user === null || user === void 0 ? void 0 : user.email) || 'provider@mixuevivu.vn'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.82}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={HERO_IMAGE} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay}>
          <View style={styles.heroCopy}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>MixueVivu Provider</Text>
            </View>
            <Text style={styles.heroEyebrow}>Bảng điều khiển đối tác</Text>
            <Text style={styles.heroTitle}>Theo dõi tour, booking và doanh thu, {providerName}.</Text>
            <Text style={styles.heroSubtitle}>
              Cập nhật tình hình kinh doanh, xử lý đơn đặt tour và chuẩn bị lịch trình cho các chuyến đi sắp tới.
            </Text>
          </View>
          <View style={styles.heroBottomRow}>
            <View style={styles.heroSummary}>
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryValue}>{(stats === null || stats === void 0 ? void 0 : stats.totalTours) || 0}</Text>
                <Text style={styles.heroSummaryLabel}>tour</Text>
              </View>
              <View style={styles.heroSummaryDivider}/>
              <View style={styles.heroSummaryItem}>
                <Text style={styles.heroSummaryValue}>{(stats === null || stats === void 0 ? void 0 : stats.totalBookings) || 0}</Text>
                <Text style={styles.heroSummaryLabel}>booking</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('AddTourTab')} activeOpacity={0.86}>
              <Text style={styles.heroButtonText}>Đăng tour mới</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ImageBackground>

        {loading ? (<View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary}/>
            <Text style={styles.loadingText}>Đang tải dữ liệu dashboard...</Text>
          </View>) : (<>
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
                <Text style={styles.kpiLabelPrimary}>Tổng doanh thu</Text>
                <Text style={styles.kpiValuePrimary}>{formatCurrency(stats === null || stats === void 0 ? void 0 : stats.totalRevenue)}</Text>
                <Text style={styles.kpiHintPrimary}>Từ booking đã xác nhận/hoàn thành</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Tour đang quản lý</Text>
                <Text style={styles.kpiValue}>{(stats === null || stats === void 0 ? void 0 : stats.totalTours) || 0}</Text>
                <Text style={styles.kpiHint}>Danh mục sản phẩm</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Lượt đặt tour</Text>
                <Text style={styles.kpiValue}>{(stats === null || stats === void 0 ? void 0 : stats.totalBookings) || 0}</Text>
                <Text style={styles.kpiHint}>Tổng booking nhận được</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Đã đối soát</Text>
                <Text style={styles.kpiValue}>{formatCurrency(stats === null || stats === void 0 ? void 0 : stats.totalPaidOut)}</Text>
                <Text style={styles.kpiHint}>Khoản đã nhận</Text>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            </View>

            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('MyToursTab')} activeOpacity={0.86}>
                <View style={styles.quickIconWrap}>
                  <Text style={styles.quickIcon}>🗺️</Text>
                </View>
                <Text style={styles.quickTitle}>Quản lý tour</Text>
                <Text style={styles.quickDesc}>Cập nhật, gửi lại tour bị từ chối và chỉnh lịch trình.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ProviderBookingsTab')} activeOpacity={0.86}>
                <View style={[styles.quickIconWrap, styles.quickIconWrapBlue]}>
                  <Text style={styles.quickIcon}>🎫</Text>
                </View>
                <Text style={styles.quickTitle}>Xử lý booking</Text>
                <Text style={styles.quickDesc}>Xác nhận, từ chối hoặc hoàn thành đơn đặt tour.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => navigation.navigate('ProviderPayoutsTab')} activeOpacity={0.86}>
                <View style={[styles.quickIconWrap, styles.quickIconWrapAmber]}>
                  <Text style={styles.quickIcon}>💰</Text>
                </View>
                <Text style={styles.quickTitle}>Theo dõi payout</Text>
                <Text style={styles.quickDesc}>Xem khoản chờ đối soát và khoản đã thanh toán.</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Doanh thu gần đây</Text>
              <Text style={styles.sectionMeta}>{recentRevenue.length} tháng</Text>
            </View>

            <View style={styles.revenuePanel}>
              {recentRevenue.length === 0 ? (<View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Chưa có doanh thu</Text>
                  <Text style={styles.emptyText}>Khi booking được xác nhận, số liệu sẽ xuất hiện tại đây.</Text>
                </View>) : (recentRevenue.map((row) => (<View key={row.month} style={styles.revenueRow}>
                    <View>
                      <Text style={styles.revenueMonth}>{row.month}</Text>
                      <Text style={styles.revenueCount}>{row.count || 0} booking</Text>
                    </View>
                    <View style={styles.revenueValueBlock}>
                      <Text style={styles.revenueValue}>{formatCurrency(row.providerAmount)}</Text>
                      <Text style={styles.revenueSub}>sau hoa hồng</Text>
                    </View>
                  </View>)))}
            </View>
          </>)}
      </ScrollView>
    </SafeAreaView>);
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
        borderBottomColor: COLORS.border + '50',
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
        borderColor: '#b8ded7',
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
        borderRadius: 999,
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
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 36,
    },
    hero: {
        minHeight: 240,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: COLORS.primary,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
    },
    heroImage: {
        borderRadius: 18,
    },
    heroOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 18,
        backgroundColor: 'rgba(6, 34, 39, 0.5)',
    },
    heroCopy: {
        maxWidth: 690,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 28,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    heroBadgeText: {
        color: COLORS.primaryDark,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    heroEyebrow: {
        color: '#dff4ef',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    heroTitle: {
        color: '#ffffff',
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '900',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.24)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        color: '#f8fafc',
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    heroBottomRow: {
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
    },
    heroSummary: {
        flexDirection: 'row',
        alignItems: 'center',
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
        color: COLORS.text,
        fontSize: 17,
        lineHeight: 22,
        fontWeight: '900',
    },
    heroSummaryLabel: {
        marginTop: 1,
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '800',
    },
    heroSummaryDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
        marginHorizontal: 6,
    },
    heroButton: {
        height: 46,
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.72)',
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
        borderRadius: 14,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border + '80',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 3 },
    },
    kpiCardPrimary: {
        flexBasis: '100%',
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
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
        gap: 12,
    },
    quickCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border + '80',
        borderRadius: 14,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 3 },
    },
    quickIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quickIconWrapBlue: {
        backgroundColor: COLORS.accentLight,
    },
    quickIconWrapAmber: {
        backgroundColor: COLORS.warningLight,
    },
    quickIcon: {
        fontSize: 18,
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
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border + '80',
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 3 },
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
