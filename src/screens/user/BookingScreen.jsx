import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { bookingService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import { TourImage } from '../../components/TourImage';
const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    primaryFixed: '#d8e2ff',
    bg: '#f7f9fb',
    surface: '#ffffff',
    surfaceContainer: '#eceef0',
    surfaceContainerLow: '#f2f4f6',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
    success: '#006c4b',
    successLight: '#e6f4ee',
    error: '#ba1a1a',
};
export default function BookingScreen({ navigation, route }) {
    var _a;
    const { colors } = useAppTheme();
    const { tour } = route.params;
    const [numPeople, setNumPeople] = useState(1);
    const [loading, setLoading] = useState(false);
    const pricePerPerson = Number(tour.price);
    const totalPrice = numPeople * pricePerPerson;
    const handleBook = async () => {
        if (numPeople < 1) {
            Alert.alert('Lỗi', 'Số người phải ít nhất là 1');
            return;
        }
        if (numPeople > tour.availableSlots) {
            Alert.alert('Lỗi', `Chỉ còn ${tour.availableSlots} chỗ`);
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tourStartDate = tour.startDate ? new Date(tour.startDate) : null;
        if (!tourStartDate || Number.isNaN(tourStartDate.getTime())) {
            Alert.alert('Lỗi', 'Tour chưa có ngày bắt đầu hợp lệ nên không thể đặt.');
            return;
        }
        tourStartDate.setHours(0, 0, 0, 0);
        if (tourStartDate <= today) {
            Alert.alert('Lỗi', 'Tour đã bắt đầu nên không thể đặt tour này nữa.');
            return;
        }
        Alert.alert('Xác nhận đặt tour', `Đặt tour "${tour.title}" cho ${numPeople} người với tổng tiền ${totalPrice.toLocaleString('vi-VN')}₫?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đặt ngay',
                onPress: async () => {
                    var _a, _b;
                    try {
                        setLoading(true);
                        await bookingService.create(tour.id, numPeople);
                        Alert.alert('🎉 Đặt tour thành công!', 'Hệ thống đã tạo giao dịch thanh toán. Bạn có thể chuyển khoản ngay để manager xác nhận.', [
                            {
                                text: 'Để sau',
                                onPress: () => navigation.goBack(),
                            },
                            {
                                text: 'Đi thanh toán',
                                onPress: () => {
                                    var _a;
                                    const parentNavigation = (_a = navigation.getParent) === null || _a === void 0 ? void 0 : _a.call(navigation);
                                    if (parentNavigation) {
                                        parentNavigation.navigate('PaymentsTab');
                                    }
                                    else {
                                        navigation.goBack();
                                    }
                                },
                            },
                        ]);
                    }
                    catch (e) {
                        Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể đặt tour');
                    }
                    finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Đặt tour</Text>
        <View style={{ width: 40 }}/>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>

        {/* ── Tour Info Card ── */}
        <View style={[styles.tourCard, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}> 
          <TourImage uri={tour.image} style={styles.tourThumb} fallbackIconSize={32}/>
          <View style={styles.tourInfo}>
            {/* Rating */}
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {((_a = tour.averageRating) === null || _a === void 0 ? void 0 : _a.toFixed(1)) || '0.0'}</Text>
              </View>
              <Text style={styles.tourLocation}>📍 {tour.location}</Text>
            </View>
            <Text style={[styles.tourTitle, { color: colors.text }]} numberOfLines={2}>{tour.title}</Text>
            <View style={styles.tourMetas}>
              <Text style={styles.tourMeta}>⏱ {tour.duration}</Text>
              <Text style={styles.tourMeta}>👥 {tour.availableSlots} chỗ trống</Text>
            </View>
          </View>
        </View>

        {/* ── Guest Counter ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👥 Số người tham gia</Text>
          <View style={[styles.counterCard, { backgroundColor: colors.surface }]}>
            <View>
              <Text style={styles.counterLabel}>Số khách</Text>
              <Text style={styles.counterNote}>Còn {tour.availableSlots} chỗ trống</Text>
            </View>
            <View style={styles.counterControls}>
              <TouchableOpacity style={[styles.counterBtn, numPeople <= 1 && styles.counterBtnDisabled]} onPress={() => setNumPeople(Math.max(1, numPeople - 1))} disabled={numPeople <= 1}>
                <Text style={[styles.counterBtnText, numPeople <= 1 && { color: COLORS.textMuted }]}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{numPeople}</Text>
              <TouchableOpacity style={[styles.counterBtn, styles.counterBtnAdd, numPeople >= tour.availableSlots && styles.counterBtnDisabled]} onPress={() => setNumPeople(Math.min(tour.availableSlots, numPeople + 1))} disabled={numPeople >= tour.availableSlots}>
                <Text style={styles.counterBtnAddText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Tour Dates ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Thông tin tour</Text>
          <View style={[styles.infoList, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
              <Text style={styles.infoValue}>
                {tour.startDate ? new Date(tour.startDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoDivider}/>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày kết thúc</Text>
              <Text style={styles.infoValue}>
                {tour.endDate ? new Date(tour.endDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Price Summary ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💰 Tóm tắt thanh toán</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {pricePerPerson.toLocaleString('vi-VN')}₫ × {numPeople} người
              </Text>
              <Text style={styles.summaryValue}>{totalPrice.toLocaleString('vi-VN')}₫</Text>
            </View>
            <View style={styles.summaryDivider}/>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
              <Text style={styles.summaryTotalValue}>{totalPrice.toLocaleString('vi-VN')}₫</Text>
            </View>
          </View>

          {/* Best price guarantee */}
          <View style={styles.guaranteeCard}>
            <Text style={styles.guaranteeIcon}>🛡️</Text>
            <Text style={styles.guaranteeText}>
              Thanh toán đúng giá tour. Hoa hồng nền tảng được hệ thống khấu trừ từ doanh thu provider.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}> 
        <View>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalAmount}>{totalPrice.toLocaleString('vi-VN')}₫</Text>
        </View>
        <TouchableOpacity style={[styles.confirmBtn, loading && { opacity: 0.7 }]} onPress={handleBook} disabled={loading} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>
            {loading ? 'Đang đặt...' : 'Xác nhận đặt'}
          </Text>
          {!loading && <Text style={styles.confirmBtnIcon}>→</Text>}
        </TouchableOpacity>
      </View>

      {/* T&C note */}
      <View style={styles.tncNote}>
        <Text style={styles.tncText}>
          Bằng cách đặt, bạn đồng ý với{' '}
          <Text style={{ color: COLORS.primary }}>Điều khoản & Điều kiện</Text>
          {' '}của chúng tôi.
        </Text>
      </View>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '40',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceContainerLow,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 18,
        color: COLORS.primary,
        fontWeight: '700',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
    },
    // Tour Card
    tourCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        borderWidth: 1,
        borderColor: COLORS.border + '30',
    },
    tourThumb: {
        width: '100%',
        height: 160,
    },
    tourThumbPlaceholder: {
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tourInfo: {
        padding: 14,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    ratingBadge: {
        backgroundColor: '#ffdcbf',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#894d00',
    },
    tourLocation: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    tourTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 22,
    },
    tourMetas: {
        flexDirection: 'row',
        gap: 16,
    },
    tourMeta: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    // Section
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 10,
    },
    // Counter Card
    counterCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    counterLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    counterNote: {
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '600',
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    counterBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterBtnAdd: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    counterBtnDisabled: {
        opacity: 0.4,
    },
    counterBtnText: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
        lineHeight: 26,
    },
    counterBtnAddText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        lineHeight: 26,
    },
    counterValue: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        minWidth: 36,
        textAlign: 'center',
    },
    // Info List
    infoList: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    infoDivider: {
        height: 1,
        backgroundColor: COLORS.border + '50',
        marginHorizontal: 16,
    },
    // Summary Card
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: COLORS.border + '50',
        marginVertical: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    // Guarantee Card
    guaranteeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: COLORS.successLight,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.success + '30',
    },
    guaranteeIcon: {
        fontSize: 20,
    },
    guaranteeText: {
        flex: 1,
        fontSize: 12,
        color: COLORS.success,
        fontWeight: '600',
        lineHeight: 18,
    },
    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 36,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.border + '40',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
    },
    totalLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    confirmBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.35,
        shadowRadius: 10,
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 15,
    },
    confirmBtnIcon: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    tncNote: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 6,
        paddingTop: 2,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
    },
    tncText: {
        fontSize: 11,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});
