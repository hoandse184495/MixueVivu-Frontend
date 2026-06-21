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
import api from '../../api/api';
import { Tour, User } from '../../types';

type Props = {
  onLogout: () => void;
};

export default function ManagerDashboardScreen({ onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingTours, setPendingTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);

  const getUserFromStorage = async () => {
    const userStorage = await AsyncStorage.getItem('user');

    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const fetchPendingTours = async () => {
    try {
      setLoading(true);

      const response = await api.get('/tours/pending');

      setPendingTours(response.data.data);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể lấy tour chờ duyệt'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tourId: number) => {
    try {
      await api.put(`/tours/${tourId}/approve`);

      Alert.alert('Thành công', 'Đã duyệt tour');
      fetchPendingTours();
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể duyệt tour'
      );
    }
  };

  const handleReject = async (tourId: number) => {
    try {
      await api.put(`/tours/${tourId}/reject`, {
        rejectReason: 'Thông tin tour chưa phù hợp, vui lòng cập nhật lại.',
      });

      Alert.alert('Thành công', 'Đã từ chối tour');
      fetchPendingTours();
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể từ chối tour'
      );
    }
  };

  const handleLogout = async () => {
    onLogout();
  };

  useEffect(() => {
    getUserFromStorage();
    fetchPendingTours();
  }, []);

  const renderTourItem = ({ item }: { item: Tour }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.tourTitle}>{item.title}</Text>
        <Text style={styles.text}>Provider: {item.providerName || 'N/A'}</Text>
        <Text style={styles.text}>Email: {item.providerEmail || 'N/A'}</Text>
        <Text style={styles.text}>Địa điểm: {item.location}</Text>
        <Text style={styles.text}>
          Giá: {Number(item.price).toLocaleString('vi-VN')} VNĐ
        </Text>
        <Text style={styles.text}>Thời gian: {item.duration}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
          >
            <Text style={styles.buttonText}>Duyệt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
          >
            <Text style={styles.buttonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      <Text style={styles.title}>Tour đang chờ duyệt</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={pendingTours}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTourItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có tour nào chờ duyệt</Text>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
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
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#43a047',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },
});
