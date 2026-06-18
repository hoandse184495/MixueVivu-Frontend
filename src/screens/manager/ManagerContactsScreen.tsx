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
import { contactService } from '../../api/services';
import { Contact } from '../../types';

const COLORS = {
  primary: '#0058bc',
  primaryLight: '#e8f0fe',
  bg: '#f7f9fb',
  surface: '#ffffff',
  text: '#191c1e',
  textMuted: '#717786',
  border: '#c1c6d7',
  success: '#006c4b',
  successLight: '#e6f4ea',
};

export default function ManagerContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactService.getAll();
      setContacts(response.data.data || []);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể tải danh sách liên hệ'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleOpenReply = (contact: Contact) => {
    setSelectedContact(contact);
    setReplyText('');
    setReplyModalVisible(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi');
      return;
    }
    if (!selectedContact) return;

    try {
      await contactService.reply(selectedContact.id, replyText.trim());
      Alert.alert('Thành công', 'Đã gửi phản hồi thành công.');
      setReplyModalVisible(false);
      fetchContacts();
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Lỗi khi gửi phản hồi'
      );
    }
  };

  const renderContactCard = ({ item }: { item: Contact }) => {
    const isReplied = !!item.reply;
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.subjectText}>{item.subject}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isReplied ? COLORS.successLight : '#fff4e5' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isReplied ? COLORS.success : '#b25e00' },
              ]}
            >
              {isReplied ? 'Đã trả lời' : 'Chưa trả lời'}
            </Text>
          </View>
        </View>

        <Text style={styles.metaText}>
          👤 Người gửi: <Text style={styles.bold}>{item.userName || 'N/A'}</Text>
        </Text>
        <Text style={styles.metaText}>📅 Ngày nhận: {dateStr}</Text>

        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Nội dung tin nhắn:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>

        {isReplied ? (
          <View style={styles.replyContainer}>
            <Text style={styles.replyTitle}>Đã phản hồi:</Text>
            <Text style={styles.replyText}>{item.reply}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.replyBtn}
            onPress={() => handleOpenReply(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.replyBtnText}>Phản hồi khách hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hỗ Trợ Khách Hàng</Text>
        <Text style={styles.headerSubtitle}>
          Xem câu hỏi, góp ý từ khách hàng và gửi phản hồi hỗ trợ
        </Text>
      </View>

      {loading && contacts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách liên hệ...</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContactCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchContacts}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📩</Text>
              <Text style={styles.emptyTitle}>Hộp thư trống</Text>
              <Text style={styles.emptySubtitle}>
                Chưa có liên hệ hay góp ý nào từ khách hàng.
              </Text>
            </View>
          }
        />
      )}

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Phản Hồi Liên Hệ</Text>
            {selectedContact && (
              <View style={styles.modalContactSummary}>
                <Text style={styles.summaryLabel}>Tiêu đề:</Text>
                <Text style={styles.summaryValue}>{selectedContact.subject}</Text>
                <Text style={styles.summaryLabel}>Nội dung khách viết:</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {selectedContact.message}
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Nội dung câu trả lời:</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Nhập nội dung phản hồi chi tiết cho khách hàng..."
              placeholderTextColor={COLORS.textMuted}
              multiline={true}
              numberOfLines={5}
              value={replyText}
              onChangeText={setReplyText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReplyModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSendReply}
              >
                <Text style={styles.modalSubmitText}>Gửi phản hồi</Text>
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subjectText: {
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
    fontSize: 11,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.text,
  },
  messageContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  replyContainer: {
    backgroundColor: '#e6f4ea',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  replyDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  replyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  replyBtnText: {
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
    marginBottom: 16,
  },
  modalContactSummary: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  replyInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    height: 120,
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
