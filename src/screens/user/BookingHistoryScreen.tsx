import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { bookingService } from '../../api/services';
import { Booking } from '../../types';

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
  warning: '#894d00',
  warningLight: '#fff3e0',
  error: '#ba1a1a',
  errorLight: '#fdecea',
};

type TabType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const TABS: { key: TabType; label: string; emoji: string }[] = [
  { key: 'all', label: 'Tất cả', emoji: '📋' },
  { key: 'pending', label: 'Chờ duyệt', emoji: '⏳' },
  { key: 'confirmed', label: 'Sắp đến', emoji: '✅' },
  { key: 'completed', label: 'Hoàn thành', emoji: '🎉' },
  { key: 'cancelled', label: 'Đã hủy', emoji: '❌' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; emoji: string }> = {
  pending: { label: 'Chờ xử lý', bg: COLORS.warningLight, color: COLORS.warning, emoji: '⏳' },
  confirmed: { label: 'Đã xác nhận', bg: COLORS.primaryLight, color: COLORS.primary, emoji: '✅' },
  completed: { label: 'Hoàn thành', bg: COLORS.successLight, color: COLORS.success, emoji: '🎉' },
  cancelled: { label: 'Đã hủy', bg: COLORS.errorLight, color: COLORS.error, emoji: '❌' },
};

export default function BookingHistoryScreen({ navigation }: { navigation?: any }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      setBookings(res.data.data || []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải lịch sử');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const handleCancel = (bookingId: number) => {
    Alert.alert(
      'Hủy booking',
      'Bạn có chắc muốn hủy booking này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy booking',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancel(bookingId);
              Alert.alert('Đã hủy', 'Booking đã được hủy thành công');
              fetchBookings();
            } catch (e: any) {
              Alert.alert('Lỗi', e.response?.data?.message || 'Không thể hủy');
            }
          },
        },
      ]
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {/* Thumbnail */}
          <View style={styles.thumbContainer}>
            {item.tourImage ? (
              <Image source={{ uri: item.tourImage }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text style={{ fontSize: 28 }}>🏔️</Text>
              </View>
            )}
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.cardInfoTop}>
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                  {statusCfg.emoji} {statusCfg.label}
                </Text>
              </View>
            </View>

            <Text style={styles.tourName} numberOfLines={2}>
              {item.tourTitle || `Tour #${item.tourId}`}
            </Text>

            {item.tourLocation && (
              <Text style={styles.locationText}>📍 {item.tourLocation}</Text>
            )}

            {item.tourStartDate && (
              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>
                  {new Date(item.tourStartDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.guestInfo}>
            <Text style={styles.guestIcon}>👥</Text>
            <Text style={styles.guestText}>{item.numPeople} người</Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Tổng tiền</Text>
            <Text style={styles.priceValue}>
              {Number(item.totalPrice).toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelBtnText}>❌ Hủy booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Lịch sử đặt tour</Text>
          <Text style={styles.headerSubtitle}>Quản lý chuyến đi của bạn</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchBookings}>
          <Text style={{ fontSize: 20 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={{ fontSize: 40 }}>🎫</Text>
              </View>
              <Text style={styles.emptyTitle}>Chưa có booking nào</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                  ? 'Hãy khám phá và đặt tour ngay!'
                  : `Không có tour ${TABS.find(t => t.key === activeTab)?.label?.toLowerCase()}`}
              </Text>
              {activeTab === 'all' && (
                <TouchableOpacity style={styles.exploreBtn}>
                  <Text style={styles.exploreBtnText}>Khám phá tour →</Text>
                </TouchableOpacity>
              )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab Bar
  tabBarContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
  },
  tabActive: {},
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // Booking Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  cardTop: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  thumbContainer: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardInfoTop: {
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tourName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateIcon: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border + '40',
    marginHorizontal: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestIcon: {
    fontSize: 16,
  },
  guestText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cancelBtn: {
    marginHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 13,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 40,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exploreBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
