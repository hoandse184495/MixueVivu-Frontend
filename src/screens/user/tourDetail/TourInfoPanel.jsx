import { Text, View } from 'react-native';
import { styles } from './styles';

export default function TourInfoPanel({ tour, colors }) {
    return (
        <View style={[styles.infoPanel, { backgroundColor: colors.surface }]}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.locationText, { color: colors.textMuted }]}>{tour.location}</Text>
          </View>

          <View style={styles.titlePriceRow}>
            <Text style={[styles.tourTitle, { color: colors.text }]} numberOfLines={3}>{tour.title}</Text>
            <View style={styles.priceBlock}>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Từ</Text>
              <Text style={styles.priceValue}>{Number(tour.price).toLocaleString('vi-VN')}₫</Text>
              <Text style={styles.pricePerPerson}>/người</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingPillText}>⭐ {tour.averageRating?.toFixed(1) || '0.0'}</Text>
              {tour.reviewCount != null ? (
                <Text style={styles.ratingPillCount}>({tour.reviewCount} đánh giá)</Text>
              ) : null}
            </View>
            {tour.category ? (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{tour.category}</Text>
              </View>
            ) : null}
          </View>
        </View>
    );
}
