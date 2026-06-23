import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { favoriteService } from '../../api/services';
import { prefetchTourImages, TourImage } from '../../components/TourImage';
import { Tour } from '../../types';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
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
  error: '#ba1a1a',
  errorLight: '#fdecea',
};

type FavItem = {
  id: number;
  tourId: number;
  tour?: Tour;
};

export default function FavoriteScreen({ navigation }: { navigation: any }) {
  const [favorites, setFavorites] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getAll();
      const nextFavorites = res.data.data || [];
      setFavorites(nextFavorites);
      prefetchTourImages(nextFavorites.map((item: FavItem) => item.tour?.image));
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemove = (tourId: number, tourTitle: string) => {
    Alert.alert(
      'Xóa yêu thích',
      `Bỏ tour "${tourTitle}" khỏi danh sách yêu thích?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoriteService.remove(tourId);
              fetchFavorites();
            } catch (e: any) {
              Alert.alert('Lỗi', e.response?.data?.message || 'Không thể xóa');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: FavItem }) => {
    const tour = item.tour;
    if (!tour) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (navigation) navigation.navigate('TourDetail', { tour });
        }}
        activeOpacity={0.85}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <TourImage uri={tour.image} style={styles.image} />
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {tour.averageRating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.contentTop}>
            <Text style={styles.tourTitle} numberOfLines={2}>{tour.title}</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(tour.id, tour.title)}
            >
              <Text style={styles.removeBtnIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.location}>📍 {tour.location}</Text>
          <Text style={styles.duration}>⏱ {tour.duration}</Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>Từ</Text>
              <Text style={styles.price}>
                {Number(tour.price).toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => navigation?.navigate('TourDetail', { tour })}
            >
              <Text style={styles.bookBtnText}>Xem ngay →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tour yêu thích</Text>
          <Text style={styles.headerSubtitle}>Quản lý danh sách tour đã lưu</Text>
        </View>
      </View>

      {loading && favorites.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchFavorites}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Text style={{ fontSize: 40 }}>❤️</Text>
              </View>
              <Text style={styles.emptyTitle}>Chưa có tour yêu thích</Text>
              <Text style={styles.emptySubtitle}>
                Nhấn ❤️ trên tour để lưu vào đây và lên kế hoạch chuyến đi
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => {
                  navigation.navigate('HomeTab', {
                    screen: 'UserHome',
                  });
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Khám phá tour ngay →</Text>
              </TouchableOpacity>
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
  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: COLORS.border + '30',
    flexDirection: 'row',
  },

  // Image
  imageContainer: {
    width: 110,
    position: 'relative',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    minHeight: 120,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.tertiaryFixed,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.tertiary,
  },

  // Content
  content: {
    flex: 1,
    padding: 12,
  },
  contentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tourTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnIcon: {
    fontSize: 14,
  },
  location: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  bookBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
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
