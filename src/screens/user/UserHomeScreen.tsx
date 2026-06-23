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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tourService, TourFilters } from '../../api/services';
import { Tour, User } from '../../types';

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
  tertiary: '#894d00',
  tertiaryFixed: '#ffdcbf',
  warning: '#894d00',
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
  const [tours, setTours] = useState<Tour[]>([]);
  const [keyword, setKeyword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [minAvailableSlots, setMinAvailableSlots] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<TourFilters>({});

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
      setTours(res.data.data || []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải tour');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUserFromStorage();
    fetchTours();
  }, []);

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

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => navigation.navigate('TourDetail', { tour: item })}
      activeOpacity={0.85}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.tourImage} />
      ) : (
        <View style={[styles.tourImage, styles.noImage]}>
          <Text style={{ fontSize: 36 }}>🏔️</Text>
        </View>
      )}

      {/* Rating badge */}
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>⭐ {item.averageRating?.toFixed(1) || '0.0'}</Text>
      </View>

      <View style={styles.tourContent}>
        <Text style={styles.tourTitle} numberOfLines={1}>{item.title}</Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>📍 {item.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.durationText}>⏱ {item.duration}</Text>
          <View style={styles.slotsBadge}>
            <Text style={styles.slotsText}>{item.availableSlots} chỗ</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Từ</Text>
            <Text style={styles.priceText}>
              {Number(item.price).toLocaleString('vi-VN')}₫
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => navigation.navigate('TourDetail', { tour: item })}
          >
            <Text style={styles.detailBtnText}>Xem chi tiết →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getInitial = (name?: string) => (name ? name[0].toUpperCase() : 'U');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitial(user?.fullName)}</Text>
            </View>
            <View>
              <Text style={styles.greetText}>Xin chào 👋</Text>
              <Text style={styles.userName}>{user?.fullName || 'Traveler'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
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
            <Text style={styles.filterToggleText}>Bộ lọc</Text>
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

        {/* ── Category Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
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
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
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

        {/* ── Recommended Tours ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tour nổi bật</Text>
            <Text style={styles.sectionCount}>{tours.length} tour</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40, marginBottom: 40 }} />
          ) : tours.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>🏖️</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy tour nào</Text>
              <Text style={styles.emptySubtitle}>Thử tìm kiếm với từ khóa khác</Text>
            </View>
          ) : (
            tours.map((item) => (
              <View key={item.id} style={{ paddingHorizontal: 16 }}>
                {renderTourCard({ item })}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryFixed,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  greetText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 48,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  filterToggle: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterToggleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  filterPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceContainerLow,
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
    borderRadius: 12,
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
    borderRadius: 12,
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
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Section
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Tour Card
  tourCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  tourImage: {
    width: '100%',
    height: 180,
  },
  noImage: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.tertiaryFixed,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
  tourContent: {
    padding: 14,
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  locationRow: {
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  slotsBadge: {
    backgroundColor: '#e6f4ee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  slotsText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  detailBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
});
