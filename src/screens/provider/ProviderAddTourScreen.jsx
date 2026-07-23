import { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { tourService, categoryService } from '../../services';
const COLORS = {
    primary: '#006c4b',
    primaryLight: '#e6f4ea',
    bg: '#f7f9fb',
    surface: '#ffffff',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
};
const MAX_IMAGE_URL_LENGTH = 2048;
export default function ProviderAddTourScreen() {
    var _a;
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
    const [categoryId, setCategoryId] = useState(null);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const submitLockRef = useRef(false);
    const navigation = useNavigation();
    const route = useRoute();
    const editingTour = (_a = route.params) === null || _a === void 0 ? void 0 : _a.editingTour;
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const catRes = await categoryService.getAll();
                const catList = (catRes.data.data || []).map((cat) => {
                    var _a, _b;
                    return ({
                        ...cat,
                        id: Number((_b = (_a = cat.id) !== null && _a !== void 0 ? _a : cat.categoryId) !== null && _b !== void 0 ? _b : cat.category_id),
                        name: cat.name || cat.categoryName,
                        slug: cat.slug || cat.name || cat.categoryName,
                    });
                });
                if (catList.length > 0) {
                    setCategoryOptions(catList);
                    setCategory(catList[0].name);
                    setCategoryId(catList[0].id);
                }
            }
            catch (error) {
                console.log('Unable to load categories:', error);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        if (!editingTour)
            return;
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
    }, [editingTour]);
    const getImageInputError = (value, label) => {
        const trimmedValue = value.trim();
        if (!trimmedValue)
            return `${label} là bắt buộc.`;
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
    const handleCreateTour = async () => {
        var _a, _b, _c, _d;
        if (submitLockRef.current)
            return;
        submitLockRef.current = true;
        setSubmitting(true);
        const releaseSubmitLock = () => {
            setSubmitting(false);
            submitLockRef.current = false;
        };
        if (!title.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập tên tour');
            return;
        }
        if (title.trim().length < 5) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Tên tour phải có ít nhất 5 ký tự');
            return;
        }
        if (!location.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập địa điểm');
            return;
        }
        if (location.trim().length < 2) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Địa điểm phải có ít nhất 2 ký tự');
            return;
        }
        if (!price.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập giá tiền');
            return;
        }
        if (!duration.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập thời lượng tour');
            return;
        }
        if (duration.trim().length < 3) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Thời lượng tour chưa hợp lệ');
            return;
        }
        if (!availableSlots.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập số lượng khách nhận');
            return;
        }
        if (!categoryId || !category.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng chọn danh mục tour');
            return;
        }
        if (!startDate.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập ngày bắt đầu');
            return;
        }
        if (!endDate.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập ngày kết thúc');
            return;
        }
        if (!description.trim()) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết tour');
            return;
        }
        if (description.trim().length < 20) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Mô tả tour phải có ít nhất 20 ký tự');
            return;
        }
        const numericPrice = Number(price);
        const numericSlots = Number(availableSlots);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Giá tiền phải là số lớn hơn 0');
            return;
        }
        if (!Number.isInteger(numericSlots) || numericSlots <= 0) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Số lượng khách nhận phải là số nguyên lớn hơn 0');
            return;
        }
        const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Ngày bắt đầu và ngày kết thúc phải có định dạng YYYY-MM-DD');
            return;
        }
        const minStartDate = new Date();
        minStartDate.setHours(0, 0, 0, 0);
        minStartDate.setDate(minStartDate.getDate() + 7);
        const selectedStartDate = new Date(`${startDate}T00:00:00.000Z`);
        if (selectedStartDate < minStartDate) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Ngày bắt đầu tour phải cách ngày hiện tại ít nhất 7 ngày mới được gửi admin duyệt.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            releaseSubmitLock();
            Alert.alert('Lỗi', 'Ngày bắt đầu không được sau ngày kết thúc');
            return;
        }
        const tourImageError = getImageInputError(image, 'Ảnh nền tour');
        if (tourImageError) {
            releaseSubmitLock();
            Alert.alert('Lỗi', tourImageError);
            return;
        }
        const data = {
            title: title.trim(),
            location: location.trim(),
            price: numericPrice,
            duration: duration.trim(),
            image: image.trim(),
            description: description.trim(),
            category: category || 'General',
            categoryId,
            availableSlots: numericSlots,
            startDate,
            endDate,
        };
        try {
            if (editingTour) {
                await tourService.update(editingTour.id, data);
            }
            else {
                await tourService.create(data);
            }
            Alert.alert('Thành công', editingTour
                    ? 'Đã cập nhật tour và gửi lại cho quản lý duyệt.'
                    : 'Đăng tour du lịch mới thành công! Đang chờ quản trị viên duyệt.', [
                {
                    text: 'OK',
                    onPress: () => {
                        var _a, _b;
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
                        setCategory(((_a = categoryOptions[0]) === null || _a === void 0 ? void 0 : _a.name) || '');
                        setCategoryId(((_b = categoryOptions[0]) === null || _b === void 0 ? void 0 : _b.id) || null);
                        // Navigate back to My Tours screen
                        navigation.navigate('MyToursTab');
                    },
                },
            ]);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || 'Không thể tạo tour mới');
        }
        finally {
            releaseSubmitLock();
        }
    };
    return (<SafeAreaView style={styles.safeArea}>
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
            <TextInput style={styles.textInput} placeholder="Ví dụ: Tour Sapa 3 ngày 2 đêm giá rẻ" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle}/>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa điểm *</Text>
            <TextInput style={styles.textInput} placeholder="Ví dụ: Sapa, Lào Cai" placeholderTextColor={COLORS.textMuted} value={location} onChangeText={setLocation}/>
          </View>

          {/* Price & Duration Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Giá tiền (VNĐ) *</Text>
              <TextInput style={styles.textInput} placeholder="Ví dụ: 2500000" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={price} onChangeText={setPrice}/>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Thời lượng *</Text>
              <TextInput style={styles.textInput} placeholder="Ví dụ: 3 ngày 2 đêm" placeholderTextColor={COLORS.textMuted} value={duration} onChangeText={setDuration}/>
            </View>
          </View>

          {/* Available Slots & Category Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Số lượng khách nhận *</Text>
              <TextInput style={styles.textInput} placeholder="Ví dụ: 15" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={availableSlots} onChangeText={setAvailableSlots}/>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Danh mục *</Text>
              <View style={styles.categorySelectContainer}>
                {categoryOptions.map((cat) => (<TouchableOpacity key={cat.id} style={[
                styles.categoryChip,
                categoryId === cat.id && styles.categoryChipActive,
            ]} onPress={() => {
                setCategory(cat.name);
                setCategoryId(cat.id);
            }}>
                    <Text style={[
                styles.categoryChipText,
                categoryId === cat.id && styles.categoryChipTextActive,
            ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>))}
              </View>
            </View>
          </View>

          {/* Tour Dates */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ngày bắt đầu *</Text>
              <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} value={startDate} onChangeText={setStartDate}/>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Ngày kết thúc *</Text>
              <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textMuted} value={endDate} onChangeText={setEndDate}/>
            </View>
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Đường dẫn ảnh nền tour (URL) *</Text>
            <TextInput style={styles.textInput} placeholder="https://images.unsplash.com/..." placeholderTextColor={COLORS.textMuted} autoCapitalize="none" value={image} onChangeText={setImage}/>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mô tả chi tiết tour *</Text>
            <TextInput style={[styles.textInput, styles.textArea]} placeholder="Nhập mô tả, điểm nổi bật và những dịch vụ bao gồm trong tour..." placeholderTextColor={COLORS.textMuted} multiline={true} numberOfLines={6} value={description} onChangeText={setDescription}/>
          </View>

          <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleCreateTour} disabled={submitting} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>
              {submitting ? 'Đang gửi thông tin...' : editingTour ? 'Lưu & gửi lại' : 'Đăng bán tour'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>);
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
