import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { activityService, tourService } from '../../services';
const COLORS = {
    primary: '#006c4b',
    primaryLight: '#e6f4ea',
    bg: '#f7f9fb',
    surface: '#ffffff',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
    error: '#ba1a1a',
    errorLight: '#fce8e6',
};
export default function ProviderMyToursScreen() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [activityModalVisible, setActivityModalVisible] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [activities, setActivities] = useState([]);
    const [activityTitle, setActivityTitle] = useState('');
    const [activityTime, setActivityTime] = useState('');
    const [activityLocation, setActivityLocation] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const navigation = useNavigation();
    const fetchMyTours = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const response = await tourService.getMyTours();
            setTours(response.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể lấy danh sách tour của bạn');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyTours();
        });
        return unsubscribe;
    }, [navigation, fetchMyTours]);
    const handleDeleteTour = (tourId) => {
        Alert.alert('Xóa tour', 'Chỉ tour chưa có booking mới có thể xóa. Tour đã có người booking sẽ được giữ lại để bảo toàn lịch sử giao dịch.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await tourService.delete(tourId);
                        setTours((current) => current.filter((tour) => tour.id !== tourId));
                        Alert.alert('Thành công', 'Tour đã được xóa khỏi danh sách của bạn.');
                        fetchMyTours();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Lỗi khi xóa tour');
                    }
                },
            },
        ]);
    };
    const getStatusDetails = (status) => {
        switch (status) {
            case 'approved':
                return { bg: '#e6f4ea', text: '#137333', label: 'Đã duyệt' };
            case 'rejected':
                return { bg: '#fce8e6', text: '#c5221f', label: 'Bị từ chối' };
            default:
                return { bg: '#fff4e5', text: '#b25e00', label: 'Chờ duyệt' };
        }
    };
    const openActivityManager = async (tour) => {
        var _a, _b;
        try {
            setSelectedTour(tour);
            setActivityModalVisible(true);
            const response = await activityService.getByTour(tour.id);
            setActivities(response.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải lịch trình');
        }
    };
    const isTourActive = (tour) => {
        if (tour.status !== 'approved')
            return false;
        if (!tour.endDate)
            return true;
        const endDate = new Date(tour.endDate);
        if (Number.isNaN(endDate.getTime()))
            return true;
        endDate.setHours(23, 59, 59, 999);
        return endDate >= new Date();
    };
    const activeTours = tours.filter(isTourActive);
    const visibleTours = activeTab === 'all' ? tours : activeTours;
    const resetActivityForm = () => {
        setActivityTitle('');
        setActivityTime('');
        setActivityLocation('');
        setActivityDescription('');
    };
    const createActivity = async () => {
        var _a, _b;
        if (!selectedTour || !activityTitle.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên hoạt động');
            return;
        }
        try {
            await activityService.create({
                tourId: selectedTour.id,
                title: activityTitle.trim(),
                activityTime: activityTime.trim(),
                location: activityLocation.trim(),
                description: activityDescription.trim(),
            });
            resetActivityForm();
            const response = await activityService.getByTour(selectedTour.id);
            setActivities(response.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể thêm hoạt động');
        }
    };
    const deleteActivity = async (id) => {
        var _a, _b;
        if (!selectedTour)
            return;
        try {
            await activityService.delete(id);
            const response = await activityService.getByTour(selectedTour.id);
            setActivities(response.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể xóa hoạt động');
        }
    };
    const renderTourCard = ({ item }) => {
        const status = getStatusDetails(item.status);
        return (<View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.tourTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.infoText}>📍 <Text style={styles.bold}>Điểm đến:</Text> {item.location}</Text>
          <Text style={styles.infoText}>⏱️ <Text style={styles.bold}>Thời lượng:</Text> {item.duration}</Text>
          <Text style={styles.infoText}>👥 <Text style={styles.bold}>Còn trống:</Text> {item.availableSlots} chỗ</Text>
          <Text style={styles.infoText}>💰 <Text style={styles.bold}>Mức giá:</Text> {Number(item.price).toLocaleString('vi-VN')} VNĐ</Text>
        </View>

        {item.status === 'rejected' && item.rejectReason ? (<View style={styles.rejectContainer}>
            <Text style={styles.rejectLabel}>Lý do từ chối:</Text>
            <Text style={styles.rejectText}>{item.rejectReason}</Text>
          </View>) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.itineraryBtn} onPress={() => openActivityManager(item)} activeOpacity={0.8}>
            <Text style={styles.itineraryBtnText}>Lịch trình</Text>
          </TouchableOpacity>
          {item.status === 'rejected' ? (<TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddTourTab', { editingTour: item })} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Sửa & gửi lại</Text>
            </TouchableOpacity>) : null}
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteTour(item.id)} activeOpacity={0.8}>
            <Text style={styles.deleteBtnText}>Xóa tour</Text>
          </TouchableOpacity>
        </View>
      </View>);
    };
    return (<SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tour Đã Đăng</Text>
          <Text style={styles.headerSubtitle}>Xem tất cả tour và các tour đã duyệt còn hoạt động</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddTourTab')} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Thêm Tour</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]} onPress={() => setActiveTab('all')} activeOpacity={0.85}>
          <Text style={[styles.tabButtonText, activeTab === 'all' && styles.tabButtonTextActive]}>
            Tour đã đăng ({tours.length})
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
          <Text style={styles.loadingText}>Đang tải danh sách tour...</Text>
        </View>) : (<FlatList data={visibleTours} keyExtractor={(item) => item.id.toString()} renderItem={renderTourCard} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onRefresh={fetchMyTours} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'all' ? 'Chưa đăng tour nào' : 'Chưa có tour hoạt động'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                    ? 'Hãy bắt đầu đăng bán những tour du lịch thú vị đầu tiên của bạn.'
                    : 'Tour đã được duyệt và chưa hết hạn sẽ hiển thị tại đây.'}
              </Text>
            </View>}/>)}

      <Modal visible={activityModalVisible} animationType="slide" onRequestClose={() => setActivityModalVisible(false)}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Lịch trình</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>{selectedTour === null || selectedTour === void 0 ? void 0 : selectedTour.title}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setActivityModalVisible(false)}>
              <Text style={styles.deleteBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.listContent}>
            {activities.map((activity) => (<View key={activity.id} style={styles.activityCard}>
                <Text style={styles.tourTitle}>{activity.title}</Text>
                {activity.time ? <Text style={styles.infoText}>⏱ {activity.time}</Text> : null}
                {activity.location ? <Text style={styles.infoText}>📍 {activity.location}</Text> : null}
                {activity.description ? <Text style={styles.infoText}>{activity.description}</Text> : null}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteActivity(activity.id)}>
                  <Text style={styles.deleteBtnText}>Xóa hoạt động</Text>
                </TouchableOpacity>
              </View>))}

            <View style={styles.activityForm}>
              <Text style={styles.tourTitle}>Thêm hoạt động</Text>
              <TextInput style={styles.input} placeholder="Tên hoạt động" value={activityTitle} onChangeText={setActivityTitle}/>
              <TextInput style={styles.input} placeholder="Thời gian, ví dụ 08:00" value={activityTime} onChangeText={setActivityTime}/>
              <TextInput style={styles.input} placeholder="Địa điểm" value={activityLocation} onChangeText={setActivityLocation}/>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Mô tả" value={activityDescription} onChangeText={setActivityDescription} multiline/>
              <TouchableOpacity style={styles.addBtnWide} onPress={createActivity}>
                <Text style={styles.addBtnText}>+ Thêm hoạt động</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tourTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
        marginRight: 10,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    detailsContainer: {
        gap: 6,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.text,
    },
    bold: {
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    rejectContainer: {
        backgroundColor: COLORS.errorLight,
        padding: 12,
        borderRadius: 12,
        marginTop: 4,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error,
    },
    rejectLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.error,
        marginBottom: 2,
    },
    rejectText: {
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eceef0',
        paddingTop: 12,
        justifyContent: 'flex-end',
        gap: 10,
    },
    editBtn: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    editBtnText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 12,
    },
    itineraryBtn: {
        backgroundColor: '#eef4ff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    itineraryBtnText: {
        color: '#0058bc',
        fontWeight: '700',
        fontSize: 12,
    },
    deleteBtn: {
        backgroundColor: COLORS.errorLight,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    deleteBtnText: {
        color: COLORS.error,
        fontWeight: '700',
        fontSize: 12,
    },
    activityCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eceef0',
        gap: 6,
    },
    activityForm: {
        backgroundColor: COLORS.surface,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eceef0',
        gap: 10,
    },
    input: {
        height: 46,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
        color: COLORS.text,
        backgroundColor: '#f8fafc',
    },
    textArea: {
        height: 90,
        paddingVertical: 10,
        textAlignVertical: 'top',
    },
    addBtnWide: {
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
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
});
