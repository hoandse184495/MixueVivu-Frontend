import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { TourImage } from '../../../components/TourImage';
import { styles } from './styles';

export default function TourHero({ tour, isFavorited, onBack, onToggleFavorite }) {
    return (
        <View style={styles.hero}>
          <TourImage uri={tour.image} style={styles.heroImage} fallbackIconSize={80} />
          <View style={styles.heroOverlay} />

          <SafeAreaView style={styles.heroActions}>
            <TouchableOpacity style={styles.glassBtn} onPress={onBack}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.glassBtn, isFavorited && styles.glassBtnFav]} onPress={onToggleFavorite}>
              <Text style={{ fontSize: 18 }}>{isFavorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
    );
}
