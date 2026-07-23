import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { categoryService } from '../../services';
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
};
export default function ManagerCategoriesScreen() {
    const { colors } = useAppTheme();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [name, setName] = useState('');
    const fetchCategories = useCallback(async () => {
        var _a, _b;
        try {
            setLoading(true);
            const res = await categoryService.getAll();
            setCategories(res.data.data || []);
        }
        catch (e) {
            Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể tải danh sách danh mục');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    const handleOpenAdd = () => {
        setEditingCategory(null);
        setName('');
        setModalVisible(true);
    };
    const handleOpenEdit = (category) => {
        setEditingCategory(category);
        setName(category.name || '');
        setModalVisible(true);
    };
    const handleDelete = (id) => {
        Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa danh mục này không?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    var _a, _b;
                    try {
                        await categoryService.delete(id);
                        Alert.alert('Thành công', 'Đã xóa danh mục.');
                        fetchCategories();
                    }
                    catch (error) {
                        Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể xóa danh mục');
                    }
                },
            },
        ]);
    };
    const handleSave = async () => {
        var _a, _b;
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
            return;
        }
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, { name: name.trim() });
                Alert.alert('Thành công', 'Đã cập nhật danh mục.');
            }
            else {
                await categoryService.create({ name: name.trim() });
                Alert.alert('Thành công', 'Đã thêm danh mục mới.');
            }
            setModalVisible(false);
            fetchCategories();
        }
        catch (error) {
            Alert.alert('Lỗi', ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Lỗi khi lưu danh mục');
        }
    };
    const renderCategoryItem = ({ item }) => {
        return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
        <View style={styles.cardInfo}>
          <Text style={[styles.catName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.catSlug, { color: colors.textMuted }]}>Slug: {item.slug}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.8}>
            <Text style={styles.deleteBtnText}>Xóa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(item)} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
        </View>
      </View>);
    };
    return (<SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Danh Mục Tour</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Quản lý các danh mục tour</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {loading && categories.length === 0 ? (<View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary}/>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải danh mục...</Text>
        </View>) : (<FlatList data={categories} keyExtractor={(item) => item.id.toString()} renderItem={renderCategoryItem} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onRefresh={fetchCategories} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏷️</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có danh mục nào</Text>
            </View>}/>)}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Tên danh mục *</Text>
              <TextInput style={[styles.textInput, { color: colors.text, borderColor: colors.border }]} placeholder="Ví dụ: Du lịch biển" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName}/>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSave}>
                <Text style={styles.modalSubmitText}>Lưu lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 4,
        maxWidth: 220,
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
        fontSize: 14,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    cardInfo: {
        marginBottom: 12,
    },
    catName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    catSlug: {
        fontSize: 13,
    },
    actionRow: {
        flexDirection: 'row',
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
        flex: 1,
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    editBtnText: {
        color: COLORS.primary,
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1.5,
        paddingHorizontal: 12,
        height: 48,
        fontSize: 14,
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
        alignItems: 'center',
    },
    modalCancelText: {
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
