import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api/api';

type Props = {
  navigation: any;
};

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('Nguyen Hoa');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0901234567');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (!fullName || !email || !password) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
        return;
      }

      setLoading(true);

      await api.post('/auth/register', {
        fullName,
        email,
        phone,
        password,
      });

      Alert.alert('Thành công', 'Đăng ký thành công, vui lòng đăng nhập');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert(
        'Đăng ký thất bại',
        error.response?.data?.message || 'Có lỗi xảy ra'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tạo tài khoản</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ tên"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f4f7fb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e88e5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    marginTop: 18,
    color: '#1e88e5',
    fontWeight: '600',
  },
});