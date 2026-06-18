import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { guideService } from '../../api/services';
import { Guide } from '../../types';

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
};

export default function ManagerGuidesScreen() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      const response = await guideService.getAll();
      setGuides(response.data.data || []);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể tải danh sách hướng dẫn viên'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleOpenAdd = () => {
    setEditingGuide(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setBio('');
    setModalVisible(true);
  };

  const handleOpenEdit = (guide: Guide) => {
    setEditingGuide(guide);
    setFullName(guide.name || '');
    setEmail(guide.email || '');
    setPhone(guide.phone || '');
    setBio(guide.experience || '');
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa hướng dẫn viên này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await guideService.delete(id);
              Alert.alert('Thành công', 'Đã xóa hướng dẫn viên.');
              fetchGuides();
            } catch (error: any) {
              Alert.alert(
                'Lỗi',
                error.response?.data?.message || 'Không thể xóa hướng dẫn viên'
              );
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền họ tên và email');
      return;
    }

    const data = {
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      experience: bio.trim(),
    };

    try {
      if (editingGuide) {
        await guideService.update(editingGuide.id, data);
        Alert.alert('Thành công', 'Đã cập nhật thông tin hướng dẫn viên.');
      } else {
        await guideService.create(data);
        Alert.alert('Thành công', 'Đã thêm hướng dẫn viên mới.');
      }
      setModalVisible(false);
      fetchGuides();
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Lỗi khi lưu thông tin hướng dẫn viên'
      );
    }
  };

  const renderGuideCard = ({ item }: { item: Guide }) => {
    const initials = item.name ? item.name.split(' ').pop()?.charAt(0).toUpperCase() : '👤';

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.guideName}>{item.name}</Text>
            {item.phone ? <Text style={styles.contactText}>📞 {item.phone}</Text> : null}
            <Text style={styles.contactText}>✉️ {item.email}</Text>
            {item.experience ? <Text style={styles.bioText} numberOfLines={2}>{item.experience}</Text> : null}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteBtnText}>Xóa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleOpenEdit(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hướng Dẫn Viên</Text>
          <Text style={styles.headerSubtitle}>Quản lý đội ngũ hướng dẫn viên du lịch chuyên nghiệp của hệ thống</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {loading && guides.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách HDV...</Text>
        </View>
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuideCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchGuides}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🧭</Text>
              <Text style={styles.emptyTitle}>Chưa có HDV nào</Text>
              <Text style={styles.emptySubtitle}>Hãy thêm hướng dẫn viên du lịch đầu tiên vào hệ thống.</Text>
            </View>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingGuide ? 'Cập nhật HDV' : 'Thêm Hướng Dẫn Viên'}
            </Text>
            <Text style={styles.modalSubtitle}>Điền thông tin chi tiết của hướng dẫn viên bên dưới:</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và Tên *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor={COLORS.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="email@address.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Số điện thoại liên hệ"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới thiệu ngắn (Bio)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Mô tả kỹ năng, kinh nghiệm..."
                placeholderTextColor={COLORS.textMuted}
                multiline={true}
                numberOfLines={3}
                value={bio}
                onChangeText={setBio}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSave}
              >
                <Text style={styles.modalSubmitText}>Lưu lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
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
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  details: {
    flex: 1,
  },
  guideName: {
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
  bioText: {
    fontSize: 13,
    color: '#414755',
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eceef0',
    paddingTop: 12,
    gap: 12,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: COLORS.errorLight,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 13,
  },
  editBtn: {
    flex: 2,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  editBtnText: {
    color: COLORS.text,
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
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
