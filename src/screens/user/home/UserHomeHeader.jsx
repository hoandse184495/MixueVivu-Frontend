import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

const getInitial = (name) => (name ? name[0].toUpperCase() : 'U');

export default function UserHomeHeader({ user, colors, unreadCount, onOpenNotifications }) {
    return (
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitial(user?.fullName)}</Text>
            </View>
            <View>
              <Text style={[styles.greetText, { color: colors.textMuted }]}>Xin chào</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Traveler'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={onOpenNotifications} activeOpacity={0.85}>
            <Text style={styles.notifText}>🔔</Text>
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
    );
}
