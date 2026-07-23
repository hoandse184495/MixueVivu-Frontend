import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from './constants';
import { styles } from './styles';
import TourCard from './TourCard';

export default function TourListSection({ loading, tours, colors, onOpenTour }) {
    return (
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
                <TourCard item={item} colors={colors} onOpenTour={onOpenTour} />
              </View>
            ))
          )}
        </View>
    );
}
