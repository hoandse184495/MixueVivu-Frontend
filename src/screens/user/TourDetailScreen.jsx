import { useEffect, useState, useCallback } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { favoriteService, tourService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import { prefetchTourImages } from '../../components/TourImage';
import { styles } from './tourDetail/styles';
import TourBottomBar from './tourDetail/TourBottomBar';
import TourDetailsTab from './tourDetail/TourDetailsTab';
import TourHero from './tourDetail/TourHero';
import TourInfoPanel from './tourDetail/TourInfoPanel';
import TourRatingTab from './tourDetail/TourRatingTab';
import TourTabBar from './tourDetail/TourTabBar';

export default function TourDetailScreen({ navigation, route }) {
    const { colors } = useAppTheme();
    const { tour: initialTour, initialTab, initialIsFavorited } = route.params;
    const [tour, setTour] = useState(initialTour);
    const [reviews, setReviews] = useState([]);
    const [isFavorited, setIsFavorited] = useState(Boolean(initialIsFavorited));
    const [activeTab, setActiveTab] = useState(initialTab || 'details');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);

    const loadDetail = useCallback(async () => {
        try {
            const [detailRes, favRes] = await Promise.allSettled([
                tourService.getById(initialTour.id),
                favoriteService.check(initialTour.id),
            ]);

            if (detailRes.status !== 'fulfilled') return;

            const nextTour = detailRes.value.data.data;

            setTour(nextTour);
            setReviews(nextTour?.reviews || []);
            prefetchTourImages([nextTour?.image]);

            if (favRes.status === 'fulfilled') {
                setIsFavorited(favRes.value.data.data?.isFavorited || false);
            }
        }
        catch (_error) {
            // Giữ dữ liệu ban đầu nếu API detail bị lỗi.
        }
    }, [initialTour.id]);

    useEffect(() => {
        setTour(initialTour);
        setReviews([]);
        setIsFavorited(Boolean(initialIsFavorited));
        loadDetail();
    }, [initialTour, initialIsFavorited, loadDetail]);

    const toggleFavorite = async () => {
        try {
            if (isFavorited) {
                await favoriteService.remove(tour.id);
                setIsFavorited(false);
            }
            else {
                await favoriteService.add(tour.id);
                setIsFavorited(true);
            }
        }
        catch (e) {
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
        }
        catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi đánh giá');
        }
        finally {
            setSubmittingReview(false);
        }
    };

    const renderActiveTab = () => {
        if (activeTab === 'rating') {
            return (
                <TourRatingTab
                  reviews={reviews}
                  colors={colors}
                  reviewText={reviewText}
                  reviewRating={reviewRating}
                  submittingReview={submittingReview}
                  onChangeReviewText={setReviewText}
                  onChangeReviewRating={setReviewRating}
                  onSubmitReview={submitReview}
                />
            );
        }

        return <TourDetailsTab tour={tour} colors={colors} />;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <TourHero
              tour={tour}
              isFavorited={isFavorited}
              onBack={() => navigation.goBack()}
              onToggleFavorite={toggleFavorite}
            />

            <TourInfoPanel tour={tour} colors={colors} />

            <TourTabBar activeTab={activeTab} colors={colors} onChangeTab={setActiveTab} />

            {renderActiveTab()}
          </ScrollView>

          <TourBottomBar
            colors={colors}
            isFavorited={isFavorited}
            onToggleFavorite={toggleFavorite}
            onBook={() => navigation.navigate('Booking', { tour })}
          />
        </View>
    );
}
