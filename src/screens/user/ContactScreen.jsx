import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
const COLORS = {
    primary: '#0058bc',
    primaryLight: '#e8f0fe',
    bg: '#f7f9fb',
    surface: '#ffffff',
    surfaceContainerLow: '#f2f4f6',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
    success: '#006c4b',
};
const FAQS = [
    { q: 'Làm thế nào để đặt tour?', a: 'Chọn tour yêu thích, nhấn "Đặt tour ngay" và điền thông tin cần thiết.' },
    { q: 'Tôi có thể hủy booking không?', a: 'Bạn có thể hủy booking khi trạng thái còn là "Chờ xử lý" trong mục Lịch sử đặt tour.' },
    { q: 'Chính sách hoàn tiền như thế nào?', a: 'Hoàn tiền 100% nếu hủy trước 48 giờ. Sau 48 giờ, phí hủy là 50%.' },
    { q: 'Làm thế nào để liên hệ hỗ trợ?', a: 'Gọi hotline 1900 xxxx hoặc email support@mixuevivu.com' },
];
export default function ContactScreen({ navigation }) {
    const { colors } = useAppTheme();
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trung tâm hỗ trợ</Text>
        <View style={{ width: 40 }}/>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🛎️</Text>
          <Text style={styles.heroTitle}>Chúng tôi luôn ở đây</Text>
          <Text style={styles.heroSubtitle}>
            Đội ngũ hỗ trợ MixueVivu sẵn sàng giúp bạn 24/7. Liên hệ với chúng tôi qua các kênh bên dưới.
          </Text>
        </View>

        {/* Contact Options */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Liên hệ nhanh</Text>
        <View style={styles.contactGrid}>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.contactEmoji}>📞</Text>
            <Text style={styles.contactLabel}>Gọi điện</Text>
            <Text style={styles.contactValue}>1900 xxxx</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: COLORS.primaryLight }]}>
            <Text style={styles.contactEmoji}>📧</Text>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue} numberOfLines={1}>support@mixuevivu.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.contactEmoji}>💬</Text>
            <Text style={styles.contactLabel}>Live Chat</Text>
            <Text style={styles.contactValue}>Bắt đầu chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.contactCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.contactEmoji}>📣</Text>
            <Text style={styles.contactLabel}>Facebook</Text>
            <Text style={styles.contactValue}>@MixueVivu</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Câu hỏi thường gặp</Text>
        {FAQS.map((faq, idx) => (<View key={idx} style={[styles.faqCard, { backgroundColor: colors.surface }]}>
            <View style={styles.faqQuestion}>
              <View style={styles.faqQIcon}>
                <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 13 }}>Q</Text>
              </View>
              <Text style={styles.faqQuestionText}>{faq.q}</Text>
            </View>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>))}

        {/* Working Hours */}
        <View style={[styles.hoursCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.hoursTitle}>🕐 Giờ làm việc</Text>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Thứ 2 - Thứ 6</Text>
            <Text style={styles.hoursTime}>8:00 - 22:00</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Thứ 7 - Chủ nhật</Text>
            <Text style={styles.hoursTime}>9:00 - 18:00</Text>
          </View>
          <View style={[styles.hoursRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.hoursDay}>Ngày lễ</Text>
            <Text style={[styles.hoursTime, { color: COLORS.success }]}>24/7 Online</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.border + '40',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.surfaceContainerLow,
        alignItems: 'center', justifyContent: 'center',
    },
    backText: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    heroCard: {
        backgroundColor: COLORS.primary, borderRadius: 24,
        padding: 24, alignItems: 'center', marginBottom: 20,
        elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 12,
    },
    heroEmoji: { fontSize: 48, marginBottom: 12 },
    heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
    contactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    contactCard: {
        width: '47%', borderRadius: 18, padding: 16, alignItems: 'center',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    },
    contactEmoji: { fontSize: 28, marginBottom: 8 },
    contactLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4, fontWeight: '600' },
    contactValue: { fontSize: 13, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
    faqCard: {
        backgroundColor: COLORS.surface, borderRadius: 16,
        padding: 14, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    },
    faqQuestion: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    faqQIcon: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    faqQuestionText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
    faqAnswer: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginLeft: 36 },
    hoursCard: {
        backgroundColor: COLORS.surface, borderRadius: 16,
        padding: 16, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    },
    hoursTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
    hoursRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: COLORS.border + '40',
    },
    hoursDay: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
    hoursTime: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});
