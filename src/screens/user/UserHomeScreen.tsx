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
import { tourService } from '../../api/services';
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
  { label: 'Tất cả', icon: '🌟' },
  { label: 'Biển', icon: '🏖️' },
  { label: 'Núi', icon: '🏔️' },
  { label: 'Thành phố', icon: '🏙️' },
  { label: 'Phiêu lưu', icon: '🧗' },
  { label: 'Gia đình', icon: '👨‍👩‍👧' },
  { label: 'Văn hóa', icon: '🏛️' },
];

const POPULAR_DESTINATIONS = [
  { name: 'Nhật Bản', region: 'Đông Á', emoji: '⛩️', color: '#FF6B6B' },
  { name: 'Bali', region: 'Indonesia', emoji: '🌴', color: '#4ECDC4' },
  { name: 'Paris', region: 'Pháp', emoji: '🗼', color: '#A8E6CF' },
  { name: 'Maldives', region: 'Ấn Độ Dương', emoji: '🏝️', color: '#88D8B0' },
  { name: 'Santorini', region: 'Hy Lạp', emoji: '🏛️', color: '#A8D8EA' },
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
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const getUserFromStorage = async () => {
    const s = await AsyncStorage.getItem('user');
    if (s) setUser(JSON.parse(s));
  };

  const fetchTours = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const res = await tourService.getAll(search || undefined);
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

  const filteredTours =
    selectedCategory === 'Tất cả'
      ? tours
      : tours.filter((t) =>
          t.category?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

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
              onSubmitEditing={() => fetchTours(keyword)}
              returnKeyType="search"
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={() => { setKeyword(''); fetchTours(); }}>
                <Text style={{ fontSize: 16, color: COLORS.textMuted }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => fetchTours(keyword)}>
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
        </View>

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
                selectedCategory === cat.label && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.label)}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.label && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Popular Destinations ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Điểm đến phổ biến</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {POPULAR_DESTINATIONS.map((dest, idx) => (
              <TouchableOpacity key={idx} style={styles.destCard} activeOpacity={0.85}>
                <View style={[styles.destImageArea, { backgroundColor: dest.color + '33' }]}>
                  <Text style={styles.destEmoji}>{dest.emoji}</Text>
                </View>
                <View style={styles.destGradient}>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <View style={styles.destRegionRow}>
                    <Text style={styles.destRegionIcon}>📍</Text>
                    <Text style={styles.destRegion}>{dest.region}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Recommended Tours ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tour nổi bật</Text>
            <Text style={styles.sectionCount}>{filteredTours.length} tour</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40, marginBottom: 40 }} />
          ) : filteredTours.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>🏖️</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy tour nào</Text>
              <Text style={styles.emptySubtitle}>Thử tìm kiếm với từ khóa khác</Text>
            </View>
          ) : (
            filteredTours.map((item) => (
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

  // Popular Destinations Card
  destCard: {
    width: 180,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 4,
  },
  destImageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destEmoji: {
    fontSize: 60,
  },
  destGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  destName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  destRegionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  destRegionIcon: {
    fontSize: 11,
  },
  destRegion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
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