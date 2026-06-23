import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api/api';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
  bg: '#f7f9fb',
  surface: '#ffffff',
  text: '#191c1e',
  textMuted: '#717786',
  border: '#c1c6d7',
  error: '#ba1a1a',
  errorLight: '#fff4f4',
};

type Props = {
  navigation: any;
};

type FieldErrors = Partial<Record<
  'fullName' | 'email' | 'phone' | 'password' | 'confirmPassword',
  string
>>;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isStrongPassword = (value: string) =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
const isValidPhone = (value: string) => !value || /^[0-9+\-\s]{9,15}$/.test(value);

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FieldErrors | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateForm = () => {
    const nextErrors: FieldErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      nextErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (trimmedName.length < 2) {
      nextErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Vui lòng nhập email';
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Email không đúng định dạng';
    }

    if (!isValidPhone(trimmedPhone)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (!isStrongPassword(password)) {
      nextErrors.password = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ và số';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      const refreshToken = response.data.data?.refreshToken;
      if (refreshToken) {
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // Account creation succeeded; user can still continue to login.
        }
      }

      Alert.alert('Thành công', 'Đăng ký thành công, vui lòng đăng nhập', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra';

      if (message.toLowerCase().includes('email')) {
        setErrors((current) => ({ ...current, email: message }));
      } else if (message.toLowerCase().includes('password')) {
        setErrors((current) => ({ ...current, password: message }));
      } else {
        Alert.alert('Đăng ký thất bại', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = ({
    field,
    label,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry,
    autoCapitalize = 'sentences',
  }: {
    field: keyof FieldErrors;
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences';
  }) => {
    const hasError = Boolean(errors[field]);
    const isFocused = focusedField === field;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[
            styles.textInput,
            isFocused && styles.textInputFocused,
            hasError && styles.textInputError,
          ]}
          value={value}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          onChangeText={(nextValue) => {
            onChangeText(nextValue);
            clearFieldError(field);
          }}
        />
        {hasError ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>✈</Text>
            </View>
            <Text style={styles.brandName}>MixueVivu</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Điền thông tin để bắt đầu chuyến đi của bạn</Text>

            {renderInput({
              field: 'fullName',
              label: 'Họ tên',
              value: fullName,
              onChangeText: setFullName,
            })}

            {renderInput({
              field: 'email',
              label: 'Email',
              value: email,
              onChangeText: setEmail,
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}

            {renderInput({
              field: 'phone',
              label: 'Số điện thoại',
              value: phone,
              onChangeText: setPhone,
              keyboardType: 'phone-pad',
            })}

            {renderInput({
              field: 'password',
              label: 'Mật khẩu',
              value: password,
              onChangeText: setPassword,
              secureTextEntry: true,
              autoCapitalize: 'none',
            })}

            {renderInput({
              field: 'confirmPassword',
              label: 'Xác nhận mật khẩu',
              value: confirmPassword,
              onChangeText: setConfirmPassword,
              secureTextEntry: true,
              autoCapitalize: 'none',
            })}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  logoText: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e6eaf2',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 7,
  },
  textInput: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1.4,
    borderColor: COLORS.border,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  textInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  textInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
