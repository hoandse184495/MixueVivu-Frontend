import { Text, TouchableOpacity, View } from 'react-native';
import { TourImage } from '../../../components/TourImage';
import { styles } from './styles';

export default function TourCard({ item, colors, onOpenTour }) {
    return (
        <TouchableOpacity style={styles.tourCard} onPress={() => onOpenTour(item)} activeOpacity={0.85}>
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
              <TouchableOpacity style={styles.detailBtn} onPress={() => onOpenTour(item)}>
                <Text style={styles.detailBtnText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
    );
}
