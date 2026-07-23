import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

export default function TourBottomBar({ colors, isFavorited, onToggleFavorite, onBook }) {
    return (
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={[styles.favBtnBottom, isFavorited && styles.favBtnBottomActive]} onPress={onToggleFavorite}>
            <Text style={{ fontSize: 22 }}>{isFavorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
            <Text style={styles.bookBtnText}>Đặt tour ngay</Text>
            <Text style={styles.bookBtnIcon}>→</Text>
          </TouchableOpacity>
        </View>
    );
}
