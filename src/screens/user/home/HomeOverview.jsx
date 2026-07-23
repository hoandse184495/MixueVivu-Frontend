import { ImageBackground, Text, View } from 'react-native';
import { styles } from './styles';

const HERO_IMAGE = {
    uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
};

export default function HomeOverview({ firstName }) {
    return (
        <View style={styles.overviewSection}>
          <ImageBackground source={HERO_IMAGE} style={styles.introCard} imageStyle={styles.introImage}>
            <View style={styles.introOverlay}>
              <View style={styles.introBadge}>
                <Text style={styles.introBadgeText}>MixueVivu Travel</Text>
              </View>
              <View style={styles.dashboardIntro}>
                <Text style={styles.heroTitle}>Chọn chuyến đi phù hợp, {firstName}</Text>
                <Text style={styles.heroSubtitle}>Khám phá tour đã duyệt, lịch trình rõ ràng và đặt chỗ nhanh trong một ứng dụng.</Text>
              </View>
            </View>
          </ImageBackground>
        </View>
    );
}
