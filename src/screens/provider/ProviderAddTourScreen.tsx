import { useEffect, useRef, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { activityService, tourService, guideService, categoryService } from '../../api/services';
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

type ItineraryItem = {
  day: string;
  title: string;
  location: string;
  image: string;
};

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

const MAX_IMAGE_URL_LENGTH = 2048;

const createEmptyItineraryItem = (day = '1'): ItineraryItem => ({
  day,
  title: '',
  location: '',
  image: '',
});

export default function ProviderAddTourScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [availableSlots, setAvailableSlots] = useState('10');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([
    createEmptyItineraryItem(),
  ]);
  
  // Guide selection
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editingTour = route.params?.editingTour;

  useEffect(() => {
    const fetchGuidesAndCategories = async () => {
      setLoadingGuides(true);

      try {
        const catRes = await categoryService.getAll();
        const catList = (catRes.data.data || []).map((cat: any) => ({
          ...cat,
          id: Number(cat.id ?? cat.categoryId ?? cat.category_id),
          name: cat.name || cat.categoryName,
          slug: cat.slug || cat.name || cat.categoryName,
        }));
        if (catList.length > 0) {
          setCategoryOptions(catList);
          setCategory(catList[0].name);
          setCategoryId(catList[0].id);
        }
      } catch (error) {
        console.log('Unable to load categories:', error);
      }

      try {
        const guideRes = await guideService.getAll();
        const guideList = guideRes.data.data || [];
        setGuides(guideList);
        if (guideList.length > 0) {
          setSelectedGuideId(guideList[0].id);
        }
      } catch {
        setGuides([]);
        setSelectedGuideId(null);
      } finally {
        setLoadingGuides(false);
      }
    };
    fetchGuidesAndCategories();
  }, []);

  useEffect(() => {
    if (!editingTour) return;

    setTitle(editingTour.title || '');
    setLocation(editingTour.location || '');
    setPrice(String(editingTour.price || ''));
    setDuration(editingTour.duration || '');
    setDescription(editingTour.description || '');
    setImage(editingTour.image || '');
    setAvailableSlots(String(editingTour.availableSlots || 10));
    setStartDate(editingTour.startDate ? String(editingTour.startDate).slice(0, 10) : '');
    setEndDate(editingTour.endDate ? String(editingTour.endDate).slice(0, 10) : '');
    setCategory(editingTour.category || '');
    setCategoryId(editingTour.categoryId || null);
    setSelectedGuideId(editingTour.guideId || null);
    setItineraryItems([createEmptyItineraryItem()]);
  }, [editingTour]);

  const updateItineraryItem = (
    index: number,
    field: keyof ItineraryItem,
    value: string
  ) => {
    setItineraryItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addItineraryItem = () => {
    const lastDay = itineraryItems[itineraryItems.length - 1]?.day || '1';
    setItineraryItems((current) => [...current, createEmptyItineraryItem(lastDay)]);
  };

  const removeItineraryItem = (index: number) => {
    setItineraryItems((current) =>
      current.length === 1
        ? [createEmptyItineraryItem()]
        : current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const getImageInputError = (value: string, label: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return '';

    if (trimmedValue.startsWith('data:image/')) {
      return `${label} phải là đường dẫn URL ảnh, không dán trực tiếp dữ liệu ảnh/base64.`;
    }

    if (trimmedValue.length > MAX_IMAGE_URL_LENGTH) {
      return `${label} quá dài. Vui lòng dùng URL ảnh ngắn hơn ${MAX_IMAGE_URL_LENGTH} ký tự.`;
    }

    if (!/^https?:\/\/\S+$/i.test(trimmedValue)) {
      return `${label} phải bắt đầu bằng http:// hoặc https://.`;
    }

    return '';
  };

  const createItineraryActivities = async (tourId: number) => {
    const validItems = itineraryItems.filter((item) => item.title.trim());

    for (const item of validItems) {
      await activityService.create({
        tourId,
        day: Number(item.day) || 1,
        title: item.title.trim(),
        activityTime: '',
        location: item.location.trim(),
        description: '',
        image: item.image.trim(),
      });
    }
  };

  const handleCreateTour = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);

    const releaseSubmitLock = () => {
      setSubmitting(false);
      submitLockRef.current = false;
    };

    if (!title.trim() || !location.trim() || !price.trim() || !duration.trim() || !description.trim()) {
      releaseSubmitLock();
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const numericPrice = Number(price);
    const numericSlots = Number(availableSlots);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      releaseSubmitLock();
      Alert.alert('Lỗi', 'Giá tiền phải là số lớn hơn 0');
      return;
    }

    if (isNaN(numericSlots) || numericSlots <= 0) {
      releaseSubmitLock();
      Alert.alert('Lỗi', 'Số chỗ trống phải là số lớn hơn 0');
      return;
    }

    const isValidDate = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      releaseSubmitLock();
      Alert.alert('Lỗi', 'Ngày bắt đầu và ngày kết thúc phải có định dạng YYYY-MM-DD');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      releaseSubmitLock();
      Alert.alert('Lỗi', 'Ngày bắt đầu không được sau ngày kết thúc');
      return;
    }

    const validItineraryItems = itineraryItems.filter((item) => item.title.trim());
    if (validItineraryItems.length === 0) {
      releaseSubmitLock();
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một hoạt động trong lịch trình.');
      return;
    }

    const tourImageError = getImageInputError(image, 'Ảnh nền tour');
    if (tourImageError) {
      releaseSubmitLock();
      Alert.alert('Lỗi', tourImageError);
      return;
    }

    const invalidActivityImage = itineraryItems.find((item) =>
      getImageInputError(item.image, 'Ảnh hoạt động')
    );
    if (invalidActivityImage) {
      releaseSubmitLock();
      Alert.alert('Lỗi', getImageInputError(invalidActivityImage.image, 'Ảnh hoạt động'));
      return;
    }

    const data = {
      title: title.trim(),
      location: location.trim(),
      price: numericPrice,
      duration: duration.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      description: description.trim(),
      category: category || 'General',
      categoryId,
      availableSlots: numericSlots,
      startDate,
      endDate,
      ...(selectedGuideId ? { guideId: selectedGuideId } : {}),
    };

    try {
      let savedTourId = editingTour?.id;
      let activityWarning = false;
      if (editingTour) {
        const response = await tourService.update(editingTour.id, data);
        savedTourId = response.data.data?.id || editingTour.id;
        if (editingTour.status === 'rejected') {
          await tourService.resubmit(editingTour.id);
        }
      } else {
        const response = await tourService.create(data);
        savedTourId = response.data.data?.id;
      }

      try {
        if (savedTourId) {
          await createItineraryActivities(savedTourId);
        }
      } catch (activityError) {
        console.log('Unable to create itinerary activities:', activityError);
        activityWarning = true;
      }

      Alert.alert(
        'Thành công',
        activityWarning
          ? 'Tour đã được lưu thành công. Một vài hoạt động lịch trình chưa lưu được, bạn có thể bổ sung lại trong phần Lịch trình.'
          : editingTour
            ? 'Đã cập nhật tour và gửi lại cho quản lý duyệt.'
            : 'Đăng tour du lịch mới thành công! Đang chờ quản trị viên duyệt.',
        [
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
            setStartDate('');
            setEndDate('');
            setCategory(categoryOptions[0]?.name || '');
            setCategoryId(categoryOptions[0]?.id || null);
            setItineraryItems([createEmptyItineraryItem()]);
            // Navigate back to My Tours screen
            navigation.navigate('MyToursTab');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo tour mới');
    } finally {
      releaseSubmitLock();
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{editingTour ? 'Sửa Tour' : 'Đăng Tour Mới'}</Text>
        <Text style={styles.headerSubtitle}>
          {editingTour ? 'Cập nhật thông tin tour và gửi lại cho quản lý duyệt' : 'Tạo tour du lịch mới và gửi cho quản lý duyệt để hiển thị lên ứng dụng'}
        </Text>
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
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      categoryId === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => {
                      setCategory(cat.name);
                      setCategoryId(cat.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        categoryId === cat.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Tour Dates */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ngày bắt đầu *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ngày kết thúc *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
                value={endDate}
                onChangeText={setEndDate}
              />
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

          <View style={styles.itinerarySection}>
            <View style={styles.itineraryHeader}>
              <View>
                <Text style={styles.sectionTitle}>Lịch trình chi tiết</Text>
                <Text style={styles.sectionSubtitle}>Nhập ngày, hoạt động, địa điểm và ảnh minh họa</Text>
              </View>
              <TouchableOpacity style={styles.addActivityBtn} onPress={addItineraryItem}>
                <Text style={styles.addActivityText}>+ Thêm</Text>
              </TouchableOpacity>
            </View>

            {itineraryItems.map((item, index) => (
              <View key={index} style={styles.itineraryCard}>
                <View style={styles.itineraryCardHeader}>
                  <Text style={styles.itineraryCardTitle}>Hoạt động {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeItineraryItem(index)}>
                    <Text style={styles.removeActivityText}>Xóa</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { marginBottom: 12 }]}>
                  <Text style={styles.inputLabel}>Ngày</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="1"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={item.day}
                    onChangeText={(value) => updateItineraryItem(index, 'day', value)}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 12 }]}>
                  <Text style={styles.inputLabel}>Tên hoạt động *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ví dụ: Check-in bản Cát Cát"
                    placeholderTextColor={COLORS.textMuted}
                    value={item.title}
                    onChangeText={(value) => updateItineraryItem(index, 'title', value)}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 12 }]}>
                  <Text style={styles.inputLabel}>Địa điểm</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ví dụ: Sa Pa, Lào Cai"
                    placeholderTextColor={COLORS.textMuted}
                    value={item.location}
                    onChangeText={(value) => updateItineraryItem(index, 'location', value)}
                  />
                </View>

                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={styles.inputLabel}>Ảnh hoạt động (URL)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://..."
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    value={item.image}
                    onChangeText={(value) => updateItineraryItem(index, 'image', value)}
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleCreateTour}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Đang gửi thông tin...' : editingTour ? 'Lưu & gửi lại' : 'Đăng bán tour'}
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
  itinerarySection: {
    marginTop: 2,
    marginBottom: 18,
    gap: 12,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  addActivityBtn: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addActivityText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  itineraryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe8e4',
    backgroundColor: '#fbfdfc',
    padding: 14,
  },
  itineraryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itineraryCardTitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  removeActivityText: {
    color: '#ba1a1a',
    fontSize: 12,
    fontWeight: '800',
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
