import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { tourService } from '../../services';
import { TourImage } from '../../components/TourImage';
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
export default function ManagerPendingToursScreen() {
    const [pendingTours, setPendingTours] = useState([]);
    const [activeTours, setActiveTours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rejectingTourId, setRejectingTourId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedTour, setSelectedTour] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const fetchPendingTours = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const [pendingResponse, activeResponse] = await Promise.all([
                tourService.getPending(),
                tourService.getAll(),
            ]);
            setPendingTours(pendingResponse.data.data || []);
            setActiveTours(activeResponse.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể lấy danh sách tour');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchPendingTours();
    }, [fetchPendingTours]);
    const handleApprove = async (tourId) => {
        Alert.alert('Xác nhận duyệt', 'Bạn có chắc chắn muốn duyệt tour này không?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Duyệt',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await tourService.approve(tourId);
                        Alert.alert('Thành công', 'Đã duyệt tour thành công.');
                        fetchPendingTours();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Lỗi khi duyệt tour');
                    }
                },
            },
        ]);
    };
    const handleOpenRejectModal = (tourId) => {
        setRejectingTourId(tourId);
        setRejectReason('');
        setModalVisible(true);
    };
    const handleOpenDetail = async (tour) => {
        setSelectedTour(tour);
        setDetailModalVisible(true);
        try {
            setDetailLoading(true);
            const response = await tourService.getById(tour.id);
            setSelectedTour(response.data.data || tour);
        }
        catch (_error) {
            setSelectedTour(tour);
        }
        finally {
            setDetailLoading(false);
        }
    };
    const handleCloseDetail = () => {
        setDetailModalVisible(false);
        setSelectedTour(null);
        setDetailLoading(false);
    };
    const handleReject = async () => {
        var _a, _b;
        if (!rejectReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
            return;
        }
        if (rejectingTourId === null)
            return;
        try {
            await tourService.reject(rejectingTourId, rejectReason.trim());
            Alert.alert('Thành công', 'Đã từ chối tour.');
            setModalVisible(false);
            setRejectingTourId(null);
            fetchPendingTours();
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Lỗi khi từ chối tour');
        }
    };
    const handleDelete = (tourId) => {
        Alert.alert('Xóa tour', 'Chỉ tour chưa có booking mới có thể xóa. Tour đã có booking sẽ được giữ lại để bảo toàn lịch sử giao dịch.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await tourService.delete(tourId);
                        Alert.alert('Thành công', 'Tour đã được xóa khỏi hệ thống.');
                        fetchPendingTours();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Lỗi khi xóa tour');
                    }
                },
            },
        ]);
    };
    const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`;
    const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A';
    const getTourActivities = (tour) => (tour === null || tour === void 0 ? void 0 : tour.activities) || (tour === null || tour === void 0 ? void 0 : tour.TourActivities) || [];
    const visibleTours = activeTab === 'pending' ? pendingTours : activeTours;
    const renderTourCard = ({ item }) => (<View style={styles.card}>
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
      <Text style={styles.metaText}>💰 <Text style={styles.bold}>Giá:</Text> {formatCurrency(item.price)}</Text>
      <Text style={styles.metaText}>🏢 <Text style={styles.bold}>Nhà cung cấp:</Text> {item.providerName || 'N/A'} ({item.providerEmail || 'N/A'})</Text>

      <Text style={styles.descriptionLabel}>Mô tả chi tiết:</Text>
      <Text style={styles.descriptionText} numberOfLines={3}>{item.description}</Text>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.detailBtn} onPress={() => handleOpenDetail(item)} activeOpacity={0.8}>
          <Text style={styles.detailBtnText}>Xem chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Xóa</Text>
        </TouchableOpacity>

        {activeTab === 'pending' ? (<>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleOpenRejectModal(item.id)} activeOpacity={0.8}>
              <Text style={styles.rejectBtnText}>Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)} activeOpacity={0.8}>
              <Text style={styles.approveBtnText}>Duyệt Tour</Text>
            </TouchableOpacity>
          </>) : null}
      </View>
    </View>);
    const renderDetailModal = () => {
        if (!selectedTour)
            return null;
        const activities = getTourActivities(selectedTour);
        return (<Modal visible={detailModalVisible} transparent={true} animationType="slide" onRequestClose={handleCloseDetail}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailSheet}>
            <View style={styles.detailHeader}>
              <View style={styles.detailHeaderText}>
                <Text style={styles.detailEyebrow}>
                  {activeTab === 'pending' ? 'Tour chờ duyệt' : 'Tour đang hoạt động'}
                </Text>
                <Text style={styles.detailTitle} numberOfLines={2}>{selectedTour.title}</Text>
              </View>
              <TouchableOpacity style={styles.detailCloseBtn} onPress={handleCloseDetail} activeOpacity={0.8}>
                <Text style={styles.detailCloseText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            {detailLoading ? (<View style={styles.detailLoadingRow}>
                <ActivityIndicator size="small" color={COLORS.primary}/>
                <Text style={styles.detailLoadingText}>Đang tải chi tiết mới nhất...</Text>
              </View>) : null}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
              <TourImage uri={selectedTour.image} style={styles.detailImage} fallbackIconSize={72}/>

              <View style={styles.detailPriceRow}>
                <View style={styles.detailPriceBlock}>
                  <Text style={styles.detailPriceLabel}>Giá tour</Text>
                  <Text style={styles.detailPriceValue}>{formatCurrency(selectedTour.price)}</Text>
                </View>
                <View style={activeTab === 'pending' ? styles.badgePending : styles.badgeActive}>
                  <Text style={activeTab === 'pending' ? styles.badgePendingText : styles.badgeActiveText}>
                    {activeTab === 'pending' ? 'Chờ duyệt' : 'Đang hoạt động'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailInfoBox}>
                  <Text style={styles.detailInfoLabel}>Địa điểm</Text>
                  <Text style={styles.detailInfoValue}>{selectedTour.location || 'N/A'}</Text>
                </View>
                <View style={styles.detailInfoBox}>
                  <Text style={styles.detailInfoLabel}>Thời lượng</Text>
                  <Text style={styles.detailInfoValue}>{selectedTour.duration || 'N/A'}</Text>
                </View>
                <View style={styles.detailInfoBox}>
                  <Text style={styles.detailInfoLabel}>Số chỗ</Text>
                  <Text style={styles.detailInfoValue}>{selectedTour.availableSlots ?? 'N/A'}</Text>
                </View>
                <View style={styles.detailInfoBox}>
                  <Text style={styles.detailInfoLabel}>Danh mục</Text>
                  <Text style={styles.detailInfoValue}>{selectedTour.category || 'N/A'}</Text>
                </View>
                <View style={styles.detailInfoBox}>
                  <Text style={styles.detailInfoLabel}>Bắt đầu</Text>
                  <Text style={styles.detailInfoValue}>{formatDate(selectedTour.startDate)}</Text>
                </View>
                <View style={styles.detailInfoBox}>
                  <Text style={styles.detailInfoLabel}>Kết thúc</Text>
                  <Text style={styles.detailInfoValue}>{formatDate(selectedTour.endDate)}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Mô tả đầy đủ</Text>
                <Text style={styles.detailDescription}>{selectedTour.description || 'Chưa có mô tả.'}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Nhà cung cấp</Text>
                <Text style={styles.detailDescription}>{selectedTour.providerName || 'N/A'}</Text>
                {selectedTour.providerEmail ? <Text style={styles.detailMutedText}>{selectedTour.providerEmail}</Text> : null}
              </View>

              {selectedTour.guideName ? (<View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Hướng dẫn viên</Text>
                  <Text style={styles.detailDescription}>{selectedTour.guideName}</Text>
                  {selectedTour.guidePhone ? <Text style={styles.detailMutedText}>{selectedTour.guidePhone}</Text> : null}
                  {selectedTour.guideExperience ? <Text style={styles.detailMutedText}>{selectedTour.guideExperience}</Text> : null}
                </View>) : null}

              {activities.length > 0 ? (<View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Lịch trình</Text>
                  {activities.map((activity, index) => (<View key={activity.id || `${activity.day}-${index}`} style={styles.activityRow}>
                      <Text style={styles.activityDay}>Ngày {activity.day || index + 1}</Text>
                      <Text style={styles.activityTitle}>{activity.title || activity.name || 'Hoạt động'}</Text>
                      {activity.description ? <Text style={styles.activityDescription}>{activity.description}</Text> : null}
                    </View>))}
                </View>) : null}
            </ScrollView>

            <View style={styles.detailActions}>
              {activeTab === 'pending' ? (<>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => {
                    handleCloseDetail();
                    handleOpenRejectModal(selectedTour.id);
                }} activeOpacity={0.8}>
                    <Text style={styles.rejectBtnText}>Từ chối</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => {
                    handleCloseDetail();
                    handleApprove(selectedTour.id);
                }} activeOpacity={0.8}>
                    <Text style={styles.approveBtnText}>Duyệt Tour</Text>
                  </TouchableOpacity>
                </>) : (<TouchableOpacity style={styles.deleteBtn} onPress={() => {
                    handleCloseDetail();
                    handleDelete(selectedTour.id);
                }} activeOpacity={0.8}>
                  <Text style={styles.deleteBtnText}>Xóa tour</Text>
                </TouchableOpacity>)}
            </View>
          </View>
        </View>
      </Modal>);
    };
    return (<SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý duyệt tour</Text>
        <Text style={styles.headerSubtitle}>Duyệt, từ chối tour mới và xóa các tour đang hoạt động khi cần.</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]} onPress={() => setActiveTab('pending')} activeOpacity={0.85}>
          <Text style={[styles.tabButtonText, activeTab === 'pending' && styles.tabButtonTextActive]}>
            Chờ duyệt ({pendingTours.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]} onPress={() => setActiveTab('active')} activeOpacity={0.85}>
          <Text style={[styles.tabButtonText, activeTab === 'active' && styles.tabButtonTextActive]}>
            Đang hoạt động ({activeTours.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && visibleTours.length === 0 ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary}/>
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>) : (<FlatList data={visibleTours} keyExtractor={(item) => item.id.toString()} renderItem={renderTourCard} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onRefresh={fetchPendingTours} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'pending' ? 'Tất cả đã được xử lý' : 'Chưa có tour hoạt động'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'pending'
                    ? 'Không có tour nào đang chờ bạn duyệt lúc này.'
                    : 'Các tour đã duyệt và đang hiển thị cho khách sẽ xuất hiện tại đây.'}
              </Text>
            </View>}/>)}

      {/* Reject Reason Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lý do từ chối duyệt</Text>
            <Text style={styles.modalSubtitle}>Nhập lý do cụ thể để gửi phản hồi lại cho Provider:</Text>

            <TextInput style={styles.reasonInput} placeholder="Ví dụ: Thông tin mô tả chưa đầy đủ, thiếu hình ảnh chi tiết..." placeholderTextColor={COLORS.textMuted} multiline={true} numberOfLines={4} value={rejectReason} onChangeText={setRejectReason}/>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleReject}>
                <Text style={styles.modalSubmitText}>Gửi từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {renderDetailModal()}
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
    detailBtn: {
        flexGrow: 1,
        flexBasis: 120,
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailBtnText: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 14,
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
    detailOverlay: {
        flex: 1,
        backgroundColor: 'rgba(17, 24, 39, 0.45)',
        justifyContent: 'flex-end',
    },
    detailSheet: {
        maxHeight: '92%',
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -8 },
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eceef0',
    },
    detailHeaderText: {
        flex: 1,
        minWidth: 0,
    },
    detailEyebrow: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    detailTitle: {
        color: COLORS.text,
        fontSize: 20,
        lineHeight: 25,
        fontWeight: '900',
    },
    detailCloseBtn: {
        minHeight: 38,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailCloseText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '800',
    },
    detailLoadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primaryLight,
    },
    detailLoadingText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '800',
    },
    detailContent: {
        padding: 20,
        paddingBottom: 18,
    },
    detailImage: {
        width: '100%',
        height: 210,
        borderRadius: 18,
        marginBottom: 16,
        overflow: 'hidden',
    },
    detailPriceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
    },
    detailPriceBlock: {
        flex: 1,
        minWidth: 0,
    },
    detailPriceLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 2,
    },
    detailPriceValue: {
        color: COLORS.primary,
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '900',
    },
    detailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    detailInfoBox: {
        flexGrow: 1,
        flexBasis: 145,
        borderRadius: 14,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#eceef0',
    },
    detailInfoLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 5,
    },
    detailInfoValue: {
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 19,
        fontWeight: '900',
    },
    detailSection: {
        borderRadius: 16,
        padding: 14,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#eceef0',
        marginBottom: 12,
    },
    detailSectionTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 8,
    },
    detailDescription: {
        color: '#414755',
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '600',
    },
    detailMutedText: {
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '700',
        marginTop: 4,
    },
    activityRow: {
        borderTopWidth: 1,
        borderTopColor: '#e5ebf2',
        paddingTop: 10,
        marginTop: 10,
    },
    activityDay: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 4,
    },
    activityTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '900',
    },
    activityDescription: {
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
        marginTop: 4,
    },
    detailActions: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eceef0',
        backgroundColor: COLORS.surface,
    },
});
