import { useEffect, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
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
const EMPTY_STATS = {
    bookings: 0,
    favorites: 0,
    reviews: 0,
};
export default function UserProfileScreen({ navigation, onLogout }) {
    const { colors } = useAppTheme();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [editVisible, setEditVisible] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        avatar: '',
    });
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await authService.getProfile();
                const { stats: profileStats, ...profileUser } = response.data.data;
                setUser(profileUser);
                setStats({ ...EMPTY_STATS, ...profileStats });
                await AsyncStorage.setItem('user', JSON.stringify(profileUser));
            }
            catch (_a) {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser)
                    setUser(JSON.parse(storedUser));
            }
        };
        loadProfile();
    }, []);
    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: onLogout,
            },
        ]);
    };
    const getInitial = (name) => (name ? name[0].toUpperCase() : 'U');
    const openEditProfile = () => {
        setForm({
            fullName: (user === null || user === void 0 ? void 0 : user.fullName) || '',
            phone: (user === null || user === void 0 ? void 0 : user.phone) || '',
            avatar: (user === null || user === void 0 ? void 0 : user.avatar) || '',
        });
        setEditVisible(true);
    };
    const handleSaveProfile = async () => {
        var _a, _b;
        const fullName = form.fullName.trim();
        const phone = form.phone.trim();
        const avatar = form.avatar.trim();
        if (!fullName) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return;
        }
        if (phone && !/^[0-9+\-\s]{9,15}$/.test(phone)) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
            return;
        }
        try {
            setSavingProfile(true);
            const response = await authService.updateProfile({ fullName, phone, avatar });
            const { stats: profileStats, ...profileUser } = response.data.data;
            setUser(profileUser);
            setStats({ ...EMPTY_STATS, ...profileStats });
            await AsyncStorage.setItem('user', JSON.stringify(profileUser));
            setEditVisible(false);
            Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
        }
        catch (error) {
            Alert.alert('Cập nhật thất bại', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể cập nhật hồ sơ');
        }
        finally {
            setSavingProfile(false);
        }
    };
    const menuItems = [
        { icon: '⚙️', label: 'Cài đặt', color: colors.surfaceContainerLow, textColor: colors.text, action: () => navigation.navigate('SettingsScreen') },
        { icon: '🎫', label: 'Booking của tôi', color: colors.primaryLight, textColor: colors.primary, action: () => { var _a; return (_a = navigation.getParent()) === null || _a === void 0 ? void 0 : _a.navigate('BookingsTab'); } },
        { icon: '❤️', label: 'Tour yêu thích', color: colors.surfaceContainerLow, textColor: colors.secondary, action: () => { var _a; return (_a = navigation.getParent()) === null || _a === void 0 ? void 0 : _a.navigate('FavoritesTab'); } },
        { icon: '💬', label: 'Liên hệ hỗ trợ', color: colors.surfaceContainerLow, textColor: colors.text, action: () => navigation.navigate('ContactScreen') },
    ];
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: `${colors.border}40` }]}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Hồ sơ</Text>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Hero */}
        <View style={[styles.profileHero, { backgroundColor: colors.surface, borderBottomColor: `${colors.border}40` }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBorder, { borderColor: colors.primary }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{getInitial(user === null || user === void 0 ? void 0 : user.fullName)}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]} onPress={openEditProfile}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>{(user === null || user === void 0 ? void 0 : user.fullName) || 'Người dùng'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{(user === null || user === void 0 ? void 0 : user.email) || ''}</Text>

          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.bookings}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Booking</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]}/>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.favorites}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Yêu thích</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]}/>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#894d00' }]}>{stats.reviews}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Đánh giá</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
            {menuItems.map((item, idx) => (<View key={idx}>
                <TouchableOpacity style={styles.menuItem} onPress={item.action}>
                  <View style={[styles.menuIconBox, { backgroundColor: item.color }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.menuLabel, { color: item.textColor }]}>{item.label}</Text>
                  <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
                </TouchableOpacity>
                {idx < menuItems.length - 1 && <View style={[styles.menuDivider, { backgroundColor: `${colors.border}40` }]}/>}
              </View>))}
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
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.errorLight, borderColor: `${colors.error}30` }]} onPress={handleLogout}>
            <View style={[styles.logoutIconBox, { backgroundColor: colors.surface, borderColor: `${colors.error}30` }]}>
              <Text style={{ fontSize: 16 }}>🚪</Text>
            </View>
            <Text style={[styles.logoutLabel, { color: colors.error }]}>Đăng xuất</Text>
            <Text style={{ color: colors.error, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chỉnh sửa hồ sơ</Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Họ tên</Text>
              <TextInput style={[
            styles.textInput,
            {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.border,
                color: colors.text,
            },
        ]} value={form.fullName} onChangeText={(fullName) => setForm((current) => ({ ...current, fullName }))} placeholder="Họ tên" placeholderTextColor={colors.textMuted}/>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Số điện thoại</Text>
              <TextInput style={[
            styles.textInput,
            {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.border,
                color: colors.text,
            },
        ]} value={form.phone} onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} placeholder="Số điện thoại" placeholderTextColor={colors.textMuted} keyboardType="phone-pad"/>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Avatar URL</Text>
              <TextInput style={[
            styles.textInput,
            {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.border,
                color: colors.text,
            },
        ]} value={form.avatar} onChangeText={(avatar) => setForm((current) => ({ ...current, avatar }))} placeholder="https://..." placeholderTextColor={colors.textMuted} autoCapitalize="none"/>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => setEditVisible(false)} disabled={savingProfile}>
                  <Text style={[styles.cancelBtnText, { color: colors.text }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn, { backgroundColor: colors.primary }, savingProfile && styles.saveBtnDisabled]} onPress={handleSaveProfile} disabled={savingProfile}>
                  <Text style={styles.saveBtnText}>
                    {savingProfile ? 'Đang lưu...' : 'Lưu'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>);
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 7,
    },
    textInput: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceContainerLow,
        paddingHorizontal: 14,
        fontSize: 15,
        color: COLORS.text,
        marginBottom: 14,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
    },
    modalBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: COLORS.surfaceContainerLow,
    },
    cancelBtnText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '700',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
    },
    saveBtnDisabled: {
        opacity: 0.65,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
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
