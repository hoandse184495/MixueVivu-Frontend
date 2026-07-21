import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { tourService } from '../../api/services';
import { Tour } from '../../types';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
  bg: '#f7f9fb',
  surface: '#ffffff',
  text: '#191c1e',
  textMuted: '#717786',
  border: '#c1c6d7',
  success: '#006c4b',
  successLight: '#64f9bc',
  error: '#ba1a1a',
  errorLight: '#ffdad6',
};

type TourReviewTab = 'pending' | 'active';

export default function ManagerPendingToursScreen() {
  const [pendingTours, setPendingTours] = useState<Tour[]>([]);
  const [activeTours, setActiveTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectingTourId, setRejectingTourId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TourReviewTab>('pending');

  const fetchPendingTours = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingResponse, activeResponse] = await Promise.all([
        tourService.getPending(),
        tourService.getAll(),
      ]);
      setPendingTours(pendingResponse.data.data || []);
      setActiveTours(activeResponse.data.data || []);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể lấy danh sách tour'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingTours();
  }, [fetchPendingTours]);

  const handleApprove = async (tourId: number) => {
    Alert.alert(
      'Xác nhận duyệt',
      'Bạn có chắc chắn muốn duyệt tour này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              await tourService.approve(tourId);
              Alert.alert('Thành công', 'Đã duyệt tour thành công.');
              fetchPendingTours();
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Lỗi khi duyệt tour');
            }
          },
        },
      ]
    );
  };

  const handleOpenRejectModal = (tourId: number) => {
    setRejectingTourId(tourId);
    setRejectReason('');
    setModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }
    if (rejectingTourId === null) return;

    try {
      await tourService.reject(rejectingTourId, rejectReason.trim());
      Alert.alert('Thành công', 'Đã từ chối tour.');
      setModalVisible(false);
      setRejectingTourId(null);
      fetchPendingTours();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Lỗi khi từ chối tour');
    }
  };

  const handleDelete = (tourId: number) => {
    Alert.alert(
      'Xóa tour',
      'Bạn có chắc chắn muốn xóa tour này không? Tour sẽ không còn hiển thị trong hệ thống.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await tourService.delete(tourId);
              Alert.alert('Thành công', 'Đã xóa tour.');
              fetchPendingTours();
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Lỗi khi xóa tour');
            }
          },
        },
      ]
    );
  };

  const visibleTours = activeTab === 'pending' ? pendingTours : activeTours;

  const renderTourCard = ({ item }: { item: Tour }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.tourTitle}>{item.title}</Text>
        <View style={activeTab === 'pending' ? styles.badgePending : styles.badgeActive}>
          <Text style={activeTab === 'pending' ? styles.badgePendingText : styles.badgeActiveText}>
            {activeTab === 'pending' ? 'Chờ duyệt' : 'Đang hoạt động'}
          </Text>
        </View>
      </View>

      <Text style={styles.metaText}>📍 <Text style={styles.bold}>Địa điểm:</Text> {item.location}</Text>
      <Text style={styles.metaText}>⏱️ <Text style={styles.bold}>Thời lượng:</Text> {item.duration}</Text>
      <Text style={styles.metaText}>💰 <Text style={styles.bold}>Giá:</Text> {Number(item.price).toLocaleString('vi-VN')} VNĐ</Text>
      <Text style={styles.metaText}>🏢 <Text style={styles.bold}>Nhà cung cấp:</Text> {item.providerName || 'N/A'} ({item.providerEmail || 'N/A'})</Text>

      <Text style={styles.descriptionLabel}>Mô tả chi tiết:</Text>
      <Text style={styles.descriptionText} numberOfLines={3}>{item.description}</Text>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteBtnText}>Xóa</Text>
        </TouchableOpacity>

        {activeTab === 'pending' ? (
          <>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleOpenRejectModal(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => handleApprove(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.approveBtnText}>Duyệt Tour</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý duyệt tour</Text>
        <Text style={styles.headerSubtitle}>Duyệt, từ chối tour mới và xóa các tour đang hoạt động khi cần.</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabButtonText, activeTab === 'pending' && styles.tabButtonTextActive]}>
            Chờ duyệt ({pendingTours.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabButtonText, activeTab === 'active' && styles.tabButtonTextActive]}>
            Đang hoạt động ({activeTours.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && visibleTours.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={visibleTours}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTourCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchPendingTours}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'pending' ? 'Tất cả đã được xử lý' : 'Chưa có tour hoạt động'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'pending'
                  ? 'Không có tour nào đang chờ bạn duyệt lúc này.'
                  : 'Các tour đã duyệt và đang hiển thị cho khách sẽ xuất hiện tại đây.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Reject Reason Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lý do từ chối duyệt</Text>
            <Text style={styles.modalSubtitle}>Nhập lý do cụ thể để gửi phản hồi lại cho Provider:</Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Ví dụ: Thông tin mô tả chưa đầy đủ, thiếu hình ảnh chi tiết..."
              placeholderTextColor={COLORS.textMuted}
              multiline={true}
              numberOfLines={4}
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleReject}
              >
                <Text style={styles.modalSubmitText}>Gửi từ chối</Text>
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
  tabBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef0',
  },
  tabButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  tabButtonText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: COLORS.primary,
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
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eceef0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  badgePending: {
    backgroundColor: '#fff4e5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePendingText: {
    color: '#b25e00',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeActive: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActiveText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 10,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#414755',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 10,
  },
  deleteBtn: {
    flexGrow: 1,
    flexBasis: 86,
    backgroundColor: '#fff7ed',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#c2410c',
    fontWeight: '800',
    fontSize: 14,
  },
  rejectBtn: {
    flexGrow: 1,
    flexBasis: 100,
    backgroundColor: COLORS.errorLight,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 14,
  },
  approveBtn: {
    flexGrow: 2,
    flexBasis: 130,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  reasonInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: COLORS.error,
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
