import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tourService, guideService, categoryService } from '../../api/services';
import { Guide } from '../../types';

const COLORS = {
  primary: '#006c4b',
  primaryLight: '#e6f4ea',
  bg: '#f7f9fb',
  surface: '#ffffff',
  text: '#191c1e',
  textMuted: '#717786',
  border: '#c1c6d7',
};

export default function ProviderAddTourScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [availableSlots, setAvailableSlots] = useState('10');
  const [category, setCategory] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  
  // Guide selection
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchGuidesAndCategories = async () => {
      try {
        setLoadingGuides(true);
        const [guideRes, catRes] = await Promise.all([
          guideService.getAll(),
          categoryService.getAll()
        ]);
        
        const guideList = guideRes.data.data || [];
        setGuides(guideList);
        if (guideList.length > 0) {
          setSelectedGuideId(guideList[0].id);
        }

        const catList = catRes.data.data || [];
        if (catList.length > 0) {
          const catNames = catList.map((c: any) => c.name);
          setCategoryOptions(catNames);
          setCategory(catNames[0]);
        }
      } catch {
        // Fallback if error
      } finally {
        setLoadingGuides(false);
      }
    };
    fetchGuidesAndCategories();
  }, []);

  const handleCreateTour = async () => {
    if (!title.trim() || !location.trim() || !price.trim() || !duration.trim() || !description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const numericPrice = Number(price);
    const numericSlots = Number(availableSlots);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Lỗi', 'Giá tiền phải là số lớn hơn 0');
      return;
    }

    if (isNaN(numericSlots) || numericSlots <= 0) {
      Alert.alert('Lỗi', 'Số chỗ trống phải là số lớn hơn 0');
      return;
    }

    // Default dates if not specified
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 7);

    const data = {
      title: title.trim(),
      location: location.trim(),
      price: numericPrice,
      duration: duration.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      description: description.trim(),
      category: category,
      availableSlots: numericSlots,
      startDate: today.toISOString().split('T')[0],
      endDate: futureDate.toISOString().split('T')[0],
      guideId: selectedGuideId || 1, // Fallback to guide ID 1 if none selected
    };

    try {
      setSubmitting(true);
      await tourService.create(data);
      Alert.alert('Thành công', 'Đăng tour du lịch mới thành công! Đang chờ quản trị viên duyệt.', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setTitle('');
            setLocation('');
            setPrice('');
            setDuration('');
            setDescription('');
            setImage('');
            setAvailableSlots('10');
            // Navigate back to My Tours screen
            navigation.navigate('MyToursTab');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo tour mới');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng Tour Mới</Text>
        <Text style={styles.headerSubtitle}>Tạo tour du lịch mới và gửi cho quản lý duyệt để hiển thị lên ứng dụng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên tour du lịch *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: Tour Sapa 3 ngày 2 đêm giá rẻ"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa điểm *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: Sapa, Lào Cai"
              placeholderTextColor={COLORS.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Price & Duration Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Giá tiền (VNĐ) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: 2500000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Thời lượng *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: 3 ngày 2 đêm"
                placeholderTextColor={COLORS.textMuted}
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>

          {/* Available Slots & Category Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Số lượng khách nhận *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: 15"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={availableSlots}
                onChangeText={setAvailableSlots}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Danh mục</Text>
              <View style={styles.categorySelectContainer}>
                {categoryOptions.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Đường dẫn ảnh nền tour (URL)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://images.unsplash.com/... (để trống sẽ dùng ảnh mặc định)"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              value={image}
              onChangeText={setImage}
            />
          </View>

          {/* Guide Selection */}
          {loadingGuides ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
          ) : (
            guides.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chọn Hướng dẫn viên du lịch *</Text>
                <View style={styles.guideSelectContainer}>
                  {guides.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[
                        styles.guideChip,
                        selectedGuideId === g.id && styles.guideChipActive,
                      ]}
                      onPress={() => setSelectedGuideId(g.id)}
                    >
                      <Text
                        style={[
                          styles.guideChipText,
                          selectedGuideId === g.id && styles.guideChipTextActive,
                        ]}
                      >
                        👤 {g.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )
          )}

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mô tả chi tiết tour *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Nhập lịch trình chi tiết và những dịch vụ bao gồm trong tour..."
              placeholderTextColor={COLORS.textMuted}
              multiline={true}
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleCreateTour}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Đang gửi thông tin...' : 'Đăng bán tour'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eceef0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  categorySelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  guideSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  guideChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#eceef0',
  },
  guideChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  guideChipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  guideChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
