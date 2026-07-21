import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tourService, categoryService, notificationService, TourFilters } from '../../api/services';
import { useAppTheme } from '../../theme/ThemeContext';
import { prefetchTourImages, TourImage } from '../../components/TourImage';
import { Notification, Tour, User } from '../../types';

const COLORS = {
  primary: '#0f766e',
  primaryDark: '#115e59',
  primaryLight: '#dff4ef',
  accent: '#2563eb',
  accentLight: '#e8efff',
  bg: '#f4f7fa',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  text: '#111827',
  textMuted: '#6b7280',
  textSoft: '#9ca3af',
  border: '#d7dee8',
  success: '#047857',
  warning: '#b45309',
  warningLight: '#fff7ed',
  error: '#ba1a1a',
};

const CATEGORIES = [
  { label: 'Tất cả', value: 'all', icon: '🌟' },
  { label: 'Biển', value: 'Beach', icon: '🏖️' },
  { label: 'Biển đảo', value: 'Biển đảo', icon: '🏝️' },
  { label: 'Phiêu lưu', value: 'Adventure', icon: '🧗' },
  { label: 'Du thuyền', value: 'Cruise', icon: '🛳️' },
  { label: 'Thiên nhiên', value: 'Nature', icon: '🏔️' },
  { label: 'Khám phá', value: 'Khám phá', icon: '🧭' },
  { label: 'Nghỉ dưỡng', value: 'Nghỉ dưỡng', icon: '🌴' },
];

type Props = {
  navigation: any;
  onLogout: () => void;
};

export default function UserHomeScreen({ navigation, onLogout }: Props) {
  const { colors } = useAppTheme();
  const [tours, setTours] = useState<Tour[]>([]);
  const [keyword, setKeyword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(CATEGORIES);
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [minAvailableSlots, setMinAvailableSlots] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TourFilters>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const getUserFromStorage = async () => {
    const s = await AsyncStorage.getItem('user');
    if (s) setUser(JSON.parse(s));
  };

  const fetchTours = useCallback(async (
    search = '',
    filters: TourFilters = {}
  ) => {
    try {
      setLoading(true);
      const res = await tourService.getAll({
        ...filters,
        search: search || undefined,
      });
      const nextTours = res.data.data || [];
      setTours(nextTours);
      prefetchTourImages(nextTours.map((tour: Tour) => tour.image));
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải tour');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      const apiCategories = res.data.data.map((cat: any) => {
        const found = CATEGORIES.find(c => c.value.toLowerCase() === cat.slug.toLowerCase() || c.label.toLowerCase() === cat.name.toLowerCase());
        return {
          label: cat.name,
          value: cat.name,
          icon: found ? found.icon : '✨'
        };
      });
      setCategories([{ label: 'Tất cả', value: 'all', icon: '🌟' }, ...apiCategories]);
    } catch (e) {
      console.log('Error fetching categories:', e);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationError('');
      const [listRes, countRes] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(listRes.data.data || []);
      const nextUnreadCount = countRes.data.data?.count || 0;
      setUnreadCount(nextUnreadCount);
      return nextUnreadCount;
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setNotificationError('Không thể tải thông báo. Vui lòng thử lại.');
      return 0;
    }
  }, []);

  useEffect(() => {
    getUserFromStorage();
    fetchCategories();
    fetchTours();
    fetchNotifications();
  }, [fetchNotifications, fetchTours]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications();
    });

    return unsubscribe;
  }, [navigation, fetchNotifications]);

  const applyAdvancedFilters = () => {
    const numericValues = [minPrice, maxPrice, minAvailableSlots].filter(Boolean);
    if (numericValues.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) {
      Alert.alert('Lỗi', 'Giá và số chỗ phải là số không âm');
      return;
    }

    if (minAvailableSlots && !Number.isInteger(Number(minAvailableSlots))) {
      Alert.alert('Lỗi', 'Số chỗ tối thiểu phải là số nguyên');
      return;
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      Alert.alert('Lỗi', 'Giá thấp nhất không được lớn hơn giá cao nhất');
      return;
    }

    const parsedStartDate = startDate
      ? new Date(`${startDate}T00:00:00.000Z`)
      : null;
    const isValidStartDate =
      !startDate ||
      (/^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
        !Number.isNaN(parsedStartDate?.getTime()) &&
        parsedStartDate?.toISOString().slice(0, 10) === startDate);

    if (!isValidStartDate) {
      Alert.alert('Lỗi', 'Ngày khởi hành phải có định dạng YYYY-MM-DD');
      return;
    }

    const filters: TourFilters = {
      location,
      minPrice,
      maxPrice,
      startDate,
      minAvailableSlots,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    };
    setAppliedFilters(filters);
    fetchTours(keyword, filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setMinAvailableSlots('');
    setSelectedCategory('all');
    setAppliedFilters({});
    fetchTours(keyword);
  };

  const openNotifications = async () => {
    setNotificationModalVisible(true);
    setNotificationLoading(true);
    await fetchNotifications();
    setNotificationLoading(false);
  };

  const markAllNotificationsAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
    } catch (error) {
      console.log('Error marking all notifications as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const openNotificationItem = async (item: Notification) => {
    if (!item.isRead) {
      setUnreadCount((current) => Math.max(current - 1, 0));
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      try {
        await notificationService.markAsRead(item.id);
      } catch (error) {
        console.log('Error marking notification as read:', error);
      }
    }

    const meta = getNotificationMeta(item);
    if (meta.targetTab) {
      setNotificationModalVisible(false);
      navigation.getParent?.()?.navigate(meta.targetTab);
    }
  };

  const getNotificationMeta = (item: Notification) => {
    const type = item.type?.toLowerCase() || '';

    if (type.includes('payment') || type.includes('thanh_toan') || item.paymentId) {
      const isSuccess = ['paid', 'confirmed'].includes(String(item.status || '').toLowerCase());
      const isDanger = ['failed', 'refunded', 'rejected'].includes(String(item.status || '').toLowerCase());

      return {
        icon: isDanger ? '!' : isSuccess ? '✓' : '$',
        iconStyle: isDanger
          ? styles.notificationIconDanger
          : isSuccess
            ? styles.notificationIconSuccess
            : styles.notificationIconPayment,
        linkLabel: 'Xem thanh toán',
        targetTab: 'PaymentsTab',
      };
    }

    if (type.includes('tour') || item.tourId) {
      const isDanger = type.includes('reject') || type.includes('rejected');

      return {
        icon: isDanger ? '!' : '★',
        iconStyle: isDanger ? styles.notificationIconDanger : styles.notificationIconTour,
        linkLabel: 'Xem lịch sử booking',
        targetTab: 'BookingsTab',
      };
    }

    if (type.includes('booking') || item.bookingId) {
      const isDanger = type.includes('reject') || type.includes('cancel');

      return {
        icon: isDanger ? '!' : '✓',
        iconStyle: isDanger ? styles.notificationIconDanger : styles.notificationIconSuccess,
        linkLabel: 'Xem lịch sử booking',
        targetTab: 'BookingsTab',
      };
    }

    return {
      icon: 'i',
      iconStyle: styles.notificationIcon,
      linkLabel: '',
      targetTab: '',
    };
  };

  const formatNotificationTime = (value?: string) => {
    if (!value) return '';
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => navigation.navigate('TourDetail', { tour: item })}
      activeOpacity={0.85}
    >
      <TourImage uri={item.image} style={styles.tourImage} />
      <View style={styles.tourContent}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.tourTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>

        <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>
          {item.location}
        </Text>

        <View style={styles.tourMetaGrid}>
          <Text style={styles.metaPill} numberOfLines={1}>{item.duration}</Text>
          <View style={styles.slotsBadge}>
            <Text style={styles.slotsText}>{item.availableSlots} chỗ</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Từ</Text>
            <Text style={styles.priceText}>
              {Number(item.price).toLocaleString('vi-VN')}₫
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => navigation.navigate('TourDetail', { tour: item })}
          >
            <Text style={styles.detailBtnText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getInitial = (name?: string) => (name ? name[0].toUpperCase() : 'U');
  const firstName = user?.fullName?.trim().split(/\s+/).pop() || 'bạn';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitial(user?.fullName)}</Text>
            </View>
            <View>
              <Text style={[styles.greetText, { color: colors.textMuted }]}>Xin chào</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Traveler'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={openNotifications} activeOpacity={0.85}>
            <Text style={styles.notifText}>🔔</Text>
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.overviewSection}>
          <View style={styles.dashboardIntro}>
            <Text style={styles.heroEyebrow}>MixueVivu Travel</Text>
            <Text style={styles.heroTitle}>Chọn chuyến đi phù hợp, {firstName}</Text>
            <Text style={styles.heroSubtitle}>Tour đã duyệt, giá rõ ràng và lịch trình theo từng ngày.</Text>
          </View>

          <View style={styles.insightGrid}>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>{tours.length}</Text>
              <Text style={styles.insightLabel}>tour đang mở</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>{categories.length}</Text>
              <Text style={styles.insightLabel}>nhóm trải nghiệm</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightValue}>24/7</Text>
              <Text style={styles.insightLabel}>hỗ trợ chuyến đi</Text>
            </View>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm điểm đến hoặc tour..."
              placeholderTextColor={COLORS.textMuted}
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={() => fetchTours(keyword, appliedFilters)}
              returnKeyType="search"
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={() => { setKeyword(''); fetchTours('', appliedFilters); }}>
                <Text style={{ fontSize: 16, color: COLORS.textMuted }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => fetchTours(keyword, appliedFilters)}>
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
            onPress={() => setShowFilters((current) => !current)}
          >
            <Text style={styles.filterToggleText}>Lọc</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <TextInput
              style={styles.filterInput}
              placeholder="Địa điểm"
              value={location}
              onChangeText={setLocation}
            />
            <View style={styles.filterRow}>
              <TextInput
                style={[styles.filterInput, styles.filterHalf]}
                placeholder="Giá thấp nhất"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.filterInput, styles.filterHalf]}
                placeholder="Giá cao nhất"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.filterRow}>
              <TextInput
                style={[styles.filterInput, styles.filterHalf]}
                placeholder="Ngày YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
              />
              <TextInput
                style={[styles.filterInput, styles.filterHalf]}
                placeholder="Số chỗ tối thiểu"
                value={minAvailableSlots}
                onChangeText={setMinAvailableSlots}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.resetFilterBtn} onPress={resetFilters}>
                <Text style={styles.resetFilterText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFilterBtn} onPress={applyAdvancedFilters}>
                <Text style={styles.applyFilterText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[
                styles.categoryChip,
                selectedCategory === cat.value && styles.categoryChipActive,
              ]}
              onPress={() => {
                const category = cat.value === 'all' ? undefined : cat.value;
                const filters = { ...appliedFilters, category };
                setSelectedCategory(cat.value);
                setAppliedFilters(filters);
                fetchTours(keyword, filters);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.value && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tour nổi bật</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Danh sách tour đang mở bán</Text>
            </View>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{tours.length} tour</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40, marginBottom: 40 }} />
          ) : tours.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Không tìm thấy tour nào</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Thử tìm kiếm với từ khóa khác</Text>
            </View>
          ) : (
            tours.map((item) => (
              <View key={item.id} style={{ paddingHorizontal: 20 }}>
                {renderTourCard({ item })}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={notificationModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.notificationSheet}>
            <View style={styles.notificationHeader}>
              <View>
                <Text style={styles.notificationTitle}>Thông báo</Text>
                <Text style={styles.notificationSubtitle}>
                  {unreadCount > 0
                    ? `${unreadCount} thông báo chưa đọc`
                    : 'Cập nhật trạng thái đơn đặt tour'}
                </Text>
              </View>
              <View style={styles.notificationHeaderActions}>
                {unreadCount > 0 ? (
                  <TouchableOpacity
                    style={styles.readAllBtn}
                    onPress={markAllNotificationsAsRead}
                  >
                    <Text style={styles.readAllBtnText}>Đã đọc</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setNotificationModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {notificationLoading ? (
              <View style={styles.notificationEmpty}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.notificationEmptyText}>Đang tải thông báo...</Text>
              </View>
            ) : notificationError ? (
              <View style={styles.notificationEmpty}>
                <Text style={styles.notificationEmptyTitle}>Có lỗi xảy ra</Text>
                <Text style={styles.notificationEmptyText}>{notificationError}</Text>
                <TouchableOpacity
                  style={styles.retryNotificationBtn}
                  onPress={async () => {
                    setNotificationLoading(true);
                    await fetchNotifications();
                    setNotificationLoading(false);
                  }}
                >
                  <Text style={styles.retryNotificationText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.notificationEmpty}>
                <Text style={styles.notificationEmptyTitle}>Chưa có thông báo</Text>
                <Text style={styles.notificationEmptyText}>
                  Trạng thái đặt tour, tour và thanh toán sẽ hiện tại đây.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((item) => {
                  const meta = getNotificationMeta(item);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.notificationItem,
                        !item.isRead && styles.notificationItemUnread,
                      ]}
                      onPress={() => openNotificationItem(item)}
                      activeOpacity={0.82}
                    >
                      <View style={[styles.notificationIcon, meta.iconStyle]}>
                        <Text style={styles.notificationIconText}>{meta.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.notificationItemTop}>
                          <Text style={styles.notificationItemTitle}>{item.title}</Text>
                          <Text style={styles.notificationTime}>
                            {formatNotificationTime(item.createdAt)}
                          </Text>
                        </View>
                        <Text style={styles.notificationMessage}>{item.message}</Text>
                        {meta.linkLabel ? (
                          <Text style={styles.notificationLink}>{meta.linkLabel}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingRight: 52,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
    position: 'relative',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  greetText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  notifBtn: {
    position: 'absolute',
    top: 8,
    right: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifText: {
    fontSize: 18,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },

  overviewSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: COLORS.bg,
  },
  dashboardIntro: {
    marginBottom: 14,
  },
  heroEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  insightGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  insightItem: {
    flex: 1,
    minHeight: 74,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.border + '70',
    justifyContent: 'center',
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 3,
  },
  insightLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textMuted,
    fontWeight: '700',
  },

  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border + '55',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 20,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  filterToggle: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  filterToggleActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  filterToggleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  filterPanel: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterInput: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceMuted,
  },
  filterHalf: {
    flex: 1,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  resetFilterBtn: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetFilterText: {
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  applyFilterBtn: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Categories
  categoryScroll: {
    flexGrow: 0,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#fff',
  },

  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '800',
  },

  tourCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: COLORS.border + '80',
  },
  tourImage: {
    width: 116,
    minHeight: 148,
  },
  tourContent: {
    flex: 1,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  tourTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  ratingBadge: {
    minWidth: 38,
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.warning,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginBottom: 10,
  },
  tourMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  slotsBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  slotsText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 1,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.accent,
  },
  detailBtn: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailBtnText: {
    color: COLORS.accent,
    fontWeight: '800',
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    justifyContent: 'flex-end',
  },
  notificationSheet: {
    maxHeight: '78%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 16,
  },
  notificationHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  notificationSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  readAllBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readAllBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
  notificationEmpty: {
    alignItems: 'center',
    paddingVertical: 42,
    paddingHorizontal: 20,
  },
  notificationEmptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 6,
  },
  notificationEmptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '600',
    marginTop: 6,
  },
  retryNotificationBtn: {
    marginTop: 16,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryNotificationText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  notificationItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border + '70',
    marginBottom: 10,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconDanger: {
    backgroundColor: COLORS.error,
  },
  notificationIconSuccess: {
    backgroundColor: COLORS.success,
  },
  notificationIconPayment: {
    backgroundColor: COLORS.accent,
  },
  notificationIconTour: {
    backgroundColor: COLORS.warning,
  },
  notificationIconText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  notificationItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  notificationItemTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  notificationTime: {
    color: COLORS.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  notificationMessage: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  notificationLink: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
  },
});
