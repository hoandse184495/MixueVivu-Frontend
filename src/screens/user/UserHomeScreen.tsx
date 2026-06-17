import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import { Tour, User } from '../../types';

type Props = {
  onLogout: () => void;
};

export default function HomeScreen({ onLogout }: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [keyword, setKeyword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const getUserFromStorage = async () => {
    const userStorage = await AsyncStorage.getItem('user');

    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  };

  const fetchTours = async (searchValue = '') => {
    try {
      setLoading(true);

      const response = await api.get('/tours', {
        params: {
          search: searchValue,
        },
      });

      setTours(response.data.data);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể lấy danh sách tour'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTours(keyword);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    onLogout();
  };

  useEffect(() => {
    getUserFromStorage();
    fetchTours();
  }, []);

  const renderTourItem = ({ item }: { item: Tour }) => {
    return (
      <View style={styles.tourCard}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.tourImage} />
        ) : (
          <View style={styles.noImage}>
            <Text>Không có ảnh</Text>
          </View>
        )}

        <View style={styles.tourContent}>
          <Text style={styles.tourTitle}>{item.title}</Text>
          <Text style={styles.tourLocation}>📍 {item.location}</Text>
          <Text style={styles.tourDuration}>⏱ {item.duration}</Text>
          <Text style={styles.tourPrice}>
            {Number(item.price).toLocaleString('vi-VN')} VNĐ
          </Text>
          <Text style={styles.tourRating}>
            ⭐ {item.averageRating || 0} | Còn {item.availableSlots} chỗ
          </Text>

          {item.guideName ? (
            <Text style={styles.guide}>HDV: {item.guideName}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Xin chào,</Text>
          <Text style={styles.userName}>
            {user?.fullName || 'User'} ({user?.role || 'user'})
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>MixueVivu Tours</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tour..."
          value={keyword}
          onChangeText={setKeyword}
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTourItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có tour nào</Text>
          }
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
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1e88e5',
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  tourCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tourImage: {
    width: '100%',
    height: 170,
  },
  noImage: {
    width: '100%',
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  tourContent: {
    padding: 14,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  tourLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  tourDuration: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#e53935',
    marginBottom: 4,
  },
  tourRating: {
    fontSize: 14,
    color: '#555',
  },
  guide: {
    fontSize: 14,
    marginTop: 4,
    color: '#1e88e5',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },
});