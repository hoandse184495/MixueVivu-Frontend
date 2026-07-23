import { Text, View } from 'react-native';
import { styles } from './styles';

export default function TourDetailsTab({ tour, colors }) {
    return (
        <View style={{ padding: 16 }}>
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.bentoEmoji}>⏱️</Text>
              <Text style={styles.bentoLabel}>Thời gian</Text>
              <Text style={styles.bentoValue}>{tour.duration}</Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.bentoEmoji}>👥</Text>
              <Text style={styles.bentoLabel}>Còn chỗ</Text>
              <Text style={styles.bentoValue}>{tour.availableSlots}</Text>
            </View>
            <View style={[styles.bentoCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.bentoEmoji}>🗂️</Text>
              <Text style={styles.bentoLabel}>Danh mục</Text>
              <Text style={styles.bentoValue} numberOfLines={1}>{tour.category || 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
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

          {tour.description ? (
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.infoCardTitle}>📋 Mô tả tour</Text>
              <Text style={styles.descText}>{tour.description}</Text>
            </View>
          ) : null}

          {tour.providerName ? (
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.infoCardTitle}>🏢 Nhà cung cấp</Text>
              <Text style={styles.infoCardText}>{tour.providerName}</Text>
              {tour.providerEmail ? <Text style={styles.infoCardText}>{tour.providerEmail}</Text> : null}
            </View>
          ) : null}
        </View>
    );
}
