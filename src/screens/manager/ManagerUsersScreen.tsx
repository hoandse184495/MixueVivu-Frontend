import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { adminService } from '../../api/services';
import { useAppTheme } from '../../theme/ThemeContext';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
  bg: '#f7f9fb',
  surface: '#ffffff',
  text: '#191c1e',
  textMuted: '#717786',
  border: '#c1c6d7',
  error: '#ba1a1a',
  errorLight: '#ffdad6',
  success: '#006c4b',
};

export default function ManagerUsersScreen() {
  const { colors } = useAppTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data.data || []);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể tải danh sách người dùng'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = (id: number, isBlocked: boolean) => {
    const actionName = isBlocked ? 'Mở khóa' : 'Khóa';
    Alert.alert(
      `Xác nhận ${actionName.toLowerCase()}`,
      `Bạn có chắc chắn muốn ${actionName.toLowerCase()} người dùng này không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: actionName,
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (isBlocked) {
                await adminService.unblockUser(id);
              } else {
                await adminService.blockUser(id);
              }
              Alert.alert('Thành công', `Đã ${actionName.toLowerCase()} người dùng.`);
              fetchUsers();
            } catch (error: any) {
              Alert.alert(
                'Lỗi',
                error.response?.data?.message || `Không thể ${actionName.toLowerCase()} người dùng`
              );
            }
          },
        },
      ]
    );
  };

  const renderUserCard = ({ item }: { item: any }) => {
    const initials = item.fullName ? item.fullName.split(' ').pop()?.charAt(0).toUpperCase() : '👤';

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={[styles.avatarCircle, { backgroundColor: item.isBlocked ? COLORS.errorLight : COLORS.primaryLight }]}>
            <Text style={[styles.avatarText, { color: item.isBlocked ? COLORS.error : COLORS.primary }]}>{initials}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.contactText}>Vai trò: {item.role}</Text>
            <Text style={styles.contactText}>✉️ {item.email}</Text>
            {item.phone ? <Text style={styles.contactText}>📞 {item.phone}</Text> : null}
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.isBlocked ? COLORS.error : COLORS.success }}>
                {item.isBlocked ? 'Đã khóa' : 'Hoạt động'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: item.isBlocked ? COLORS.primaryLight : COLORS.errorLight }]}
            onPress={() => handleToggleBlock(item.id, item.isBlocked)}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, { color: item.isBlocked ? COLORS.primary : COLORS.error }]}>
              {item.isBlocked ? 'Mở khóa' : 'Khóa tài khoản'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Người Dùng</Text>
          <Text style={styles.headerSubtitle}>Quản lý tài khoản hệ thống</Text>
        </View>
      </View>

      {loading && users.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchUsers}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyTitle}>Chưa có người dùng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    maxWidth: 220,
    lineHeight: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eceef0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  details: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eceef0',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
});
