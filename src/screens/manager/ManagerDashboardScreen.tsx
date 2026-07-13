import { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminService } from '../../api/services';
import { User } from '../../types';

type Props = {
  onLogout: () => void;
};

export default function ManagerDashboardScreen({ onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getUserFromStorage = async () => {
    const userStorage = await AsyncStorage.getItem('user');
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      setStats(res.data.data);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể lấy thống kê dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    onLogout();
  };

  useEffect(() => {
    getUserFromStorage();
    fetchDashboardStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Manager Dashboard</Text>
          <Text style={styles.userName}>
            {user?.fullName || 'Manager'} ({user?.role || 'manager'})
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Tổng quan hệ thống</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : stats ? (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Tổng người dùng</Text>
          </View>
          <View style={styles.rowStats}>
            <View style={[styles.statCard, styles.halfCard]}>
              <Text style={styles.statIcon}>🗺️</Text>
              <Text style={styles.statValue}>{stats.totalTours || 0}</Text>
              <Text style={styles.statLabel}>Tổng tour</Text>
            </View>
            <View style={[styles.statCard, styles.halfCard]}>
              <Text style={styles.statIcon}>🎫</Text>
              <Text style={styles.statValue}>{stats.totalBookings || 0}</Text>
              <Text style={styles.statLabel}>Tổng booking</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{Number(stats.totalRevenue || 0).toLocaleString('vi-VN')}₫</Text>
            <Text style={styles.statLabel}>Tổng doanh thu (lịch sử)</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7fb',
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  logout: {
    color: '#e53935',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
    color: '#1e88e5',
  },
  statsContainer: {
    gap: 14,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  rowStats: {
    flexDirection: 'row',
    gap: 14,
  },
  halfCard: {
    flex: 1,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e88e5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#717786',
    fontWeight: '600',
  },
});
