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

export default function ProviderDashboardScreen({ onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);

  const getUserFromStorage = async () => {
    const userStorage = await AsyncStorage.getItem('user');

    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const fetchMyTours = async () => {
    try {
      setLoading(true);

      const response = await api.get('/tours/my-tours');

      setTours(response.data.data);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể lấy tour của provider'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    onLogout();
  };

  useEffect(() => {
    getUserFromStorage();
    fetchMyTours();
  }, []);

  const getStatusText = (status?: string) => {
    if (status === 'approved') return 'Đã duyệt';
    if (status === 'rejected') return 'Bị từ chối';
    return 'Chờ duyệt';
  };

  const renderTourItem = ({ item }: { item: Tour }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.tourTitle}>{item.title}</Text>
        <Text style={styles.text}>Địa điểm: {item.location}</Text>
        <Text style={styles.text}>
          Giá: {Number(item.price).toLocaleString('vi-VN')} VNĐ
        </Text>
        <Text style={styles.text}>Thời gian: {item.duration}</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>

        {item.status === 'rejected' && item.rejectReason ? (
          <Text style={styles.rejectReason}>
            Lý do từ chối: {item.rejectReason}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Provider Dashboard</Text>
          <Text style={styles.userName}>
            {user?.fullName || 'Provider'} ({user?.role || 'provider'})
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          Alert.alert(
            'Thông báo',
            'Bước tiếp theo mình sẽ làm màn hình Add Tour cho provider.'
          )
        }
      >
        <Text style={styles.addButtonText}>+ Đăng tour mới</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tour tôi đã đăng</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTourItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Bạn chưa đăng tour nào</Text>
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
  addButton: {
    backgroundColor: '#1e88e5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
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
  statusBox: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#1e88e5',
    fontWeight: '700',
  },
  rejectReason: {
    marginTop: 8,
    color: '#e53935',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },
});