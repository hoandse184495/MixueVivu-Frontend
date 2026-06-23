import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { tourService, activityService, favoriteService } from '../../api/services';
import { prefetchTourImages, TourImage } from '../../components/TourImage';
import { Tour, Activity, Review } from '../../types';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
  primaryFixed: '#d8e2ff',
  secondary: '#006c4b',
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

type Props = {
  navigation: any;
  route: any;
};

type TabType = 'details' | 'activities' | 'rating';

export default function TourDetailScreen({ navigation, route }: Props) {
  const { tour: initialTour } = route.params as { tour: Tour };
  const [tour, setTour] = useState<Tour>(initialTour);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [loading, setLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const [detailRes, actRes, favRes] = await Promise.all([
        tourService.getById(initialTour.id),
        activityService.getByTour(initialTour.id),
        favoriteService.check(initialTour.id),
      ]);
      const nextTour = detailRes.data.data;
      setTour(nextTour);
      setActivities(actRes.data.data || []);
      setReviews(nextTour?.reviews || []);
      prefetchTourImages([nextTour?.image]);
      setIsFavorited(favRes.data.data?.isFavorited || false);
    } catch {
      // use initial data if fetch fails
    } finally {
      setLoading(false);
    }
  }, [initialTour.id]);

  useEffect(() => { loadDetail(); }, []);

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoriteService.remove(tour.id);
        setIsFavorited(false);
      } else {
        await favoriteService.add(tour.id);
        setIsFavorited(true);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setSubmittingReview(true);
      await tourService.addReview(tour.id, reviewRating, reviewText.trim());
      Alert.alert('Thành công', 'Đánh giá đã được gửi!');
      setReviewText('');
      setReviewRating(5);
      loadDetail();
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const groupedActivities = activities.reduce((acc, act) => {
    const day = `Ngày ${act.day}`;
    if (!acc[day]) acc[day] = [];
    acc[day].push(act);
    return acc;
  }, {} as Record<string, Activity[]>);

  // ── Tab: Activities ──
  const renderActivitiesTab = () => (
    <View style={{ padding: 16 }}>
      {Object.keys(groupedActivities).length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40 }}>📅</Text>
          <Text style={styles.emptyText}>Chưa có lịch trình</Text>
        </View>
      ) : (
        Object.entries(groupedActivities).map(([day, acts], dayIdx) => (
          <View key={day} style={styles.dayBlock}>
            <View style={styles.dayHeader}>
              <View style={styles.dayDot}>
                <Text style={styles.dayDotText}>{dayIdx + 1}</Text>
              </View>
              <Text style={styles.dayTitle}>{day}</Text>
            </View>
            <View style={styles.dayActivities}>
              {acts.map((act, idx) => (
                <View key={idx} style={styles.activityCard}>
                  {act.time && (
                    <Text style={styles.actTime}>🕐 {act.time}</Text>
                  )}
                  <Text style={styles.actTitle}>{act.title}</Text>
                  {act.description && (
                    <Text style={styles.actDesc}>{act.description}</Text>
                  )}
                  {act.location && (
                    <Text style={styles.actLocation}>📍 {act.location}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ── Tab: Details ──
  const renderDetailsTab = () => (
    <View style={{ padding: 16 }}>
      {/* Bento Quick Info */}
      <View style={styles.bentoGrid}>
        <View style={styles.bentoCard}>
          <Text style={styles.bentoEmoji}>⏱️</Text>
          <Text style={styles.bentoLabel}>Thời gian</Text>
          <Text style={styles.bentoValue}>{tour.duration}</Text>
        </View>
        <View style={styles.bentoCard}>
          <Text style={styles.bentoEmoji}>👥</Text>
          <Text style={styles.bentoLabel}>Còn chỗ</Text>
          <Text style={styles.bentoValue}>{tour.availableSlots}</Text>
        </View>
        <View style={styles.bentoCard}>
          <Text style={styles.bentoEmoji}>🗂️</Text>
          <Text style={styles.bentoLabel}>Danh mục</Text>
          <Text style={styles.bentoValue} numberOfLines={1}>{tour.category || 'N/A'}</Text>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>📆 Thời gian tour</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>Bắt đầu</Text>
          <Text style={styles.infoRowValue}>
            {tour.startDate ? new Date(tour.startDate).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoRowLabel}>Kết thúc</Text>
          <Text style={styles.infoRowValue}>
            {tour.endDate ? new Date(tour.endDate).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {tour.description ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>📋 Mô tả tour</Text>
          <Text style={styles.descText}>{tour.description}</Text>
        </View>
      ) : null}

      {/* Guide */}
      {tour.guideName && (
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>🧭 Hướng dẫn viên</Text>
          <View style={styles.guideCard}>
            <View style={styles.guideAvatar}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guideName}>{tour.guideName}</Text>
              {tour.guidePhone && <Text style={styles.guideMeta}>📞 {tour.guidePhone}</Text>}
              {tour.guideExperience && <Text style={styles.guideMeta}>🏆 {tour.guideExperience}</Text>}
              {tour.guideLanguage && <Text style={styles.guideMeta}>🌐 {tour.guideLanguage}</Text>}
            </View>
          </View>
        </View>
      )}

      {/* Provider */}
      {tour.providerName && (
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>🏢 Nhà cung cấp</Text>
          <Text style={styles.infoCardText}>{tour.providerName}</Text>
          {tour.providerEmail && <Text style={styles.infoCardText}>{tour.providerEmail}</Text>}
        </View>
      )}
    </View>
  );

  // ── Tab: Rating ──
  const renderRatingTab = () => (
    <View style={{ padding: 16 }}>
      {/* Write Review */}
      <View style={styles.reviewForm}>
        <Text style={styles.reviewFormTitle}>✍️ Viết đánh giá</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setReviewRating(star)} style={styles.starBtn}>
              <Text style={[styles.starText, { color: star <= reviewRating ? '#F59E0B' : '#D1D5DB' }]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingNum}>{reviewRating}/5</Text>
        </View>
        <TextInput
          style={styles.reviewInput}
          placeholder="Chia sẻ cảm nhận của bạn về tour này..."
          placeholderTextColor={COLORS.textMuted}
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={[styles.submitBtn, submittingReview && { opacity: 0.7 }]}
          onPress={submitReview}
          disabled={submittingReview}
        >
          <Text style={styles.submitBtnText}>
            {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <Text style={styles.reviewsCount}>Đánh giá ({reviews.length})</Text>
      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 36 }}>⭐</Text>
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
      ) : (
        reviews.map((r, idx) => (
          <View key={idx} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 16 }}>
                  {r.userName?.[0] || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewUser}>{r.userName || 'Người dùng'}</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Text key={s} style={{ fontSize: 12, color: s <= r.rating ? '#F59E0B' : '#D1D5DB' }}>★</Text>
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>
                {new Date(r.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <Text style={styles.reviewComment}>{r.comment}</Text>
          </View>
        ))
      )}
    </View>
  );

  const TABS: { key: TabType; label: string }[] = [
    { key: 'details', label: 'Chi tiết' },
    { key: 'activities', label: 'Hoạt động' },
    { key: 'rating', label: 'Đánh giá' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Hero Section ── */}
        <View style={styles.hero}>
          <TourImage uri={tour.image} style={styles.heroImage} fallbackIconSize={80} />

          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Back + Favorite */}
          <SafeAreaView style={styles.heroActions}>
            <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.glassBtn, isFavorited && styles.glassBtnFav]}
              onPress={toggleFavorite}
            >
              <Text style={{ fontSize: 18 }}>{isFavorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ── Info Panel ── */}
        <View style={styles.infoPanel}>
          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{tour.location}</Text>
          </View>

          {/* Title + Price */}
          <View style={styles.titlePriceRow}>
            <Text style={styles.tourTitle} numberOfLines={3}>{tour.title}</Text>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>Từ</Text>
              <Text style={styles.priceValue}>{Number(tour.price).toLocaleString('vi-VN')}₫</Text>
              <Text style={styles.pricePerPerson}>/người</Text>
            </View>
          </View>

          {/* Rating + Tag */}
          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingPillText}>⭐ {tour.averageRating?.toFixed(1) || '0.0'}</Text>
              {tour.reviewCount != null && (
                <Text style={styles.ratingPillCount}>({tour.reviewCount} đánh giá)</Text>
              )}
            </View>
            {tour.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{tour.category}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Tab Bar ── */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ── */}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'activities' && renderActivitiesTab()}
        {activeTab === 'rating' && renderRatingTab()}

      </ScrollView>

      {/* ── Fixed Bottom Action Bar ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.favBtnBottom, isFavorited && styles.favBtnBottomActive]}
          onPress={toggleFavorite}
        >
          <Text style={{ fontSize: 22 }}>{isFavorited ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('Booking', { tour })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Đặt tour ngay</Text>
          <Text style={styles.bookBtnIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Hero
  hero: {
    position: 'relative',
    height: 320,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  glassBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBtnFav: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Info Panel
  infoPanel: {
    backgroundColor: COLORS.surface,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tourTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    lineHeight: 22,
  },
  pricePerPerson: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffdcbf',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.tertiary,
  },
  ratingPillCount: {
    fontSize: 11,
    color: COLORS.tertiary,
    fontWeight: '500',
  },
  categoryTag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
    marginTop: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Bento Grid
  bentoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  bentoEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  bentoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  bentoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoRowLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  infoRowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border + '40',
  },
  descText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  infoCardText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 2,
  },

  // Guide Card
  guideCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guideAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  guideMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 2,
  },

  // Day Activities
  dayBlock: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dayActivities: {
    marginLeft: 40,
    gap: 10,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  actTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  actTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  actDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  actLocation: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },

  // Review
  reviewForm: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  reviewFormTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  starBtn: {
    padding: 4,
  },
  starText: {
    fontSize: 28,
  },
  ratingNum: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  reviewInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewsCount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: '500',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface + 'F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 26,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '40',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  favBtnBottom: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  favBtnBottomActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fff0f0',
  },
  bookBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  bookBtnIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
