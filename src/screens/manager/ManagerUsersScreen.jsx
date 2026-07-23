import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { adminService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
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
    success: '#006c4b',
};
const emptyForm = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    providerStatus: 'approved',
};
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value) => /^(0|\+84)[0-9]{9,10}$/.test(value.trim().replace(/\s+/g, ''));
export default function ManagerUsersScreen() {
    const { colors } = useAppTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const fetchUsers = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const response = await adminService.getAllUsers();
            setUsers(response.data.data || []);
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải danh sách người dùng');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    const handleToggleBlock = (id, isBlocked) => {
        const actionName = isBlocked ? 'Mở khóa' : 'Khóa';
        Alert.alert(`Xác nhận ${actionName.toLowerCase()}`, `Bạn có chắc chắn muốn ${actionName.toLowerCase()} người dùng này không?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: actionName,
                style: isBlocked ? 'default' : 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        if (isBlocked) {
                            await adminService.unblockUser(id);
                        }
                        else {
                            await adminService.blockUser(id);
                        }
                        Alert.alert('Thành công', `Đã ${actionName.toLowerCase()} người dùng.`);
                        fetchUsers();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || `Không thể ${actionName.toLowerCase()} người dùng`);
                    }
                },
            },
        ]);
    };
    const handleProviderApproval = (id, approve) => {
        Alert.alert(approve ? 'Duyệt provider' : 'Từ chối provider', approve
            ? 'Cho phép provider này đăng và quản lý tour?'
            : 'Từ chối provider này với lý do mặc định?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: approve ? 'Duyệt' : 'Từ chối',
                style: approve ? 'default' : 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        if (approve) {
                            await adminService.approveProvider(id);
                        }
                        else {
                            await adminService.rejectProvider(id, 'Thông tin công ty chưa đạt yêu cầu');
                        }
                        fetchUsers();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể cập nhật provider');
                    }
                },
            },
        ]);
    };
    const openCreateModal = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setModalVisible(true);
    };
    const openEditModal = (user) => {
        setEditingUser(user);
        setForm({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            role: user.role || 'user',
            providerStatus: user.providerStatus || 'approved',
        });
        setModalVisible(true);
    };
    const closeModal = () => {
        setModalVisible(false);
        setEditingUser(null);
        setForm(emptyForm);
    };
    const updateForm = (key, value) => {
        setForm((current) => ({
            ...current,
            [key]: value,
            ...(key === 'role' && value !== 'provider'
                ? { providerStatus: 'approved' }
                : {}),
        }));
    };
    const validateForm = () => {
        if (!form.fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return false;
        }
        if (form.fullName.trim().length < 2) {
            Alert.alert('Lỗi', 'Họ tên phải có ít nhất 2 ký tự');
            return false;
        }
        if (!form.email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return false;
        }
        if (!isValidEmail(form.email)) {
            Alert.alert('Lỗi', 'Email không đúng định dạng');
            return false;
        }
        if (!form.phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return false;
        }
        if (!isValidPhone(form.phone)) {
            Alert.alert('Lỗi', 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số');
            return false;
        }
        if (!editingUser && !form.password) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cho người dùng mới');
            return false;
        }
        if (form.password && (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số');
            return false;
        }
        return true;
    };
    const handleSaveUser = async () => {
        var _a, _b;
        if (!validateForm())
            return;
        const payload = {
            ...form,
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            ...(editingUser && !form.password ? { password: undefined } : {}),
        };
        if (payload.role === 'provider') {
            delete payload.providerStatus;
        }
        try {
            setSaving(true);
            if (editingUser) {
                await adminService.updateUser(editingUser.id, payload);
                Alert.alert('Thành công', 'Đã cập nhật người dùng.');
            }
            else {
                await adminService.createUser(payload);
                Alert.alert('Thành công', 'Đã thêm người dùng mới.');
            }
            closeModal();
            fetchUsers();
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể lưu người dùng');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteUser = (id) => {
        Alert.alert('Xóa người dùng', 'Bạn có chắc chắn muốn xóa người dùng này không? Nếu tài khoản đã có dữ liệu liên quan, hệ thống sẽ yêu cầu khóa tài khoản thay vì xóa.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await adminService.deleteUser(id);
                        Alert.alert('Thành công', 'Đã xóa người dùng.');
                        fetchUsers();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể xóa người dùng');
                    }
                },
            },
        ]);
    };
    const renderUserCard = ({ item }) => {
        var _a;
        const initials = item.fullName ? (_a = item.fullName.split(' ').pop()) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase() : '👤';
        return (<View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={[styles.avatarCircle, { backgroundColor: !item.isActive ? COLORS.errorLight : COLORS.primaryLight }]}>
            <Text style={[styles.avatarText, { color: !item.isActive ? COLORS.error : COLORS.primary }]}>{initials}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.contactText}>Vai trò: {item.role}</Text>
            <Text style={styles.contactText}>✉️ {item.email}</Text>
            {item.phone ? <Text style={styles.contactText}>📞 {item.phone}</Text> : null}
            {item.role === 'provider' ? (<Text style={styles.contactText}>Trạng thái provider: {item.providerStatus || 'approved'}</Text>) : null}
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: !item.isActive ? COLORS.error : COLORS.success }}>
                {!item.isActive ? 'Đã khóa' : 'Hoạt động'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight }]} onPress={() => openEditModal(item)} activeOpacity={0.8}>
            <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: !item.isActive ? COLORS.primaryLight : COLORS.errorLight }]} onPress={() => handleToggleBlock(item.id, !item.isActive)} activeOpacity={0.8}>
            <Text style={[styles.actionBtnText, { color: !item.isActive ? COLORS.primary : COLORS.error }]}>
              {!item.isActive ? 'Mở khóa' : 'Khóa tài khoản'}
            </Text>
          </TouchableOpacity>
          {item.role === 'provider' && item.providerStatus === 'pending' ? (<>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight }]} onPress={() => handleProviderApproval(item.id, true)} activeOpacity={0.8}>
                <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Duyệt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.errorLight }]} onPress={() => handleProviderApproval(item.id, false)} activeOpacity={0.8}>
                <Text style={[styles.actionBtnText, { color: COLORS.error }]}>Từ chối</Text>
              </TouchableOpacity>
            </>) : null}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fff7ed' }]} onPress={() => handleDeleteUser(item.id)} activeOpacity={0.8}>
            <Text style={[styles.actionBtnText, { color: '#c2410c' }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>);
    };
    return (<SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Người Dùng</Text>
          <Text style={styles.headerSubtitle}>Quản lý tài khoản hệ thống</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal} activeOpacity={0.85}>
          <Text style={styles.addButtonText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {loading && users.length === 0 ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary}/>
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>) : (<FlatList data={users} keyExtractor={(item) => item.id.toString()} renderItem={renderUserCard} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onRefresh={fetchUsers} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyTitle}>Chưa có người dùng nào</Text>
            </View>}/>)}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
              </Text>

              <TextInput style={styles.input} placeholder="Họ tên *" placeholderTextColor={COLORS.textMuted} value={form.fullName} onChangeText={(value) => updateForm('fullName', value)}/>
              <TextInput style={styles.input} placeholder="Email *" placeholderTextColor={COLORS.textMuted} value={form.email} onChangeText={(value) => updateForm('email', value)} autoCapitalize="none" keyboardType="email-address"/>
              <TextInput style={styles.input} placeholder={editingUser ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu *'} placeholderTextColor={COLORS.textMuted} value={form.password} onChangeText={(value) => updateForm('password', value)} secureTextEntry/>
              <TextInput style={styles.input} placeholder="Số điện thoại *" placeholderTextColor={COLORS.textMuted} value={form.phone} onChangeText={(value) => updateForm('phone', value)} keyboardType="phone-pad"/>

              <Text style={styles.fieldLabel}>Vai trò</Text>
              <View style={styles.segmentRow}>
                {['user', 'provider', 'manager'].map((role) => (<TouchableOpacity key={role} style={[styles.segmentBtn, form.role === role && styles.segmentBtnActive]} onPress={() => updateForm('role', role)}>
                    <Text style={[styles.segmentText, form.role === role && styles.segmentTextActive]}>
                      {role}
                    </Text>
                  </TouchableOpacity>))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={closeModal} disabled={saving}>
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveUser} disabled={saving}>
                  <Text style={styles.modalSaveText}>{saving ? 'Đang lưu' : 'Lưu'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
    addButton: {
        minHeight: 40,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '800',
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
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
    },
    details: {
        flex: 1,
    },
    userName: {
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
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#eceef0',
        paddingTop: 12,
        gap: 8,
    },
    actionBtn: {
        flexGrow: 1,
        flexBasis: 96,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionBtnText: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.48)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
    },
    modalContent: {
        width: '100%',
        maxWidth: 460,
        maxHeight: '88%',
        borderRadius: 18,
        backgroundColor: COLORS.surface,
        padding: 18,
        elevation: 16,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 14,
    },
    input: {
        minHeight: 46,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    textArea: {
        minHeight: 84,
        textAlignVertical: 'top',
    },
    fieldLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 8,
        marginTop: 2,
    },
    segmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    segmentBtn: {
        flexGrow: 1,
        minHeight: 38,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    segmentBtnActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    segmentText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '800',
    },
    segmentTextActive: {
        color: COLORS.primary,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    modalCancelBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '800',
    },
    modalSaveBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSaveText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '800',
    },
});
