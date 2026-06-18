import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
  secondary: '#006c4b',
  secondaryFixed: '#68fcbf',
  bg: '#f7f9fb',
  surface: '#ffffff',
  surfaceContainer: '#eceef0',
  surfaceContainerLow: '#f2f4f6',
  text: '#191c1e',
  textMuted: '#717786',
  border: '#c1c6d7',
  error: '#ba1a1a',
  errorLight: '#fdecea',
};

type Props = {
  navigation: any;
  onLogout: () => void;
};

export default function UserProfileScreen({ navigation, onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const s = await AsyncStorage.getItem('user');
      if (s) setUser(JSON.parse(s));
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const getInitial = (name?: string) => (name ? name[0].toUpperCase() : 'U');

  const menuItems = [
    { icon: '🎫', label: 'Booking của tôi', color: COLORS.primaryLight, textColor: COLORS.primary, action: () => {} },
    { icon: '❤️', label: 'Tour yêu thích', color: '#e6f4ee', textColor: COLORS.secondary, action: () => {} },
    { icon: '⭐', label: 'Đánh giá của tôi', color: '#fff3e0', textColor: '#894d00', action: () => {} },
    { icon: '💬', label: 'Liên hệ hỗ trợ', color: COLORS.surfaceContainerLow, textColor: COLORS.text, action: () => navigation.navigate('ContactScreen') },
    { icon: '⚙️', label: 'Cài đặt', color: COLORS.surfaceContainerLow, textColor: COLORS.text, action: () => {} },
    { icon: '❓', label: 'Trung tâm hỗ trợ', color: COLORS.surfaceContainerLow, textColor: COLORS.text, action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitial(user?.fullName)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Booking</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.secondary }]}>8</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#894d00' }]}>24</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            {menuItems.map((item, idx) => (
              <View key={idx}>
                <TouchableOpacity style={styles.menuItem} onPress={item.action}>
                  <View style={[styles.menuIconBox, { backgroundColor: item.color }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.menuLabel, { color: item.textColor }]}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                {idx < menuItems.length - 1 && <View style={styles.menuDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Refer & Earn Card */}
        <View style={styles.referCard}>
          <View style={styles.referContent}>
            <Text style={styles.referTitle}>Giới thiệu & Nhận thưởng</Text>
            <Text style={styles.referSubtitle}>
              Mời bạn bè dùng MixueVivu và nhận ưu đãi hấp dẫn cho lần đặt tiếp theo.
            </Text>
            <TouchableOpacity style={styles.referBtn}>
              <Text style={styles.referBtnText}>Mời bạn bè →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.referDecoEmoji}>🎁</Text>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={styles.logoutIconBox}>
              <Text style={{ fontSize: 16 }}>🚪</Text>
            </View>
            <Text style={styles.logoutLabel}>Đăng xuất</Text>
            <Text style={{ color: COLORS.error, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Hero
  profileHero: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // Menu
  menuSection: {
    padding: 16,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border + '40',
    marginHorizontal: 16,
  },

  // Refer Card
  referCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  referContent: {
    flex: 1,
  },
  referTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  referSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 14,
  },
  referBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: 'flex-start',
  },
  referBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  referDecoEmoji: {
    fontSize: 52,
    opacity: 0.6,
    marginLeft: 12,
  },

  // Logout
  logoutSection: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
});
