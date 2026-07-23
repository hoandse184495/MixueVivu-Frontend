import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const COLORS = {
    surface: '#ffffff',
    text: '#191c1e',
    textMuted: '#717786',
    border: '#c1c6d7',
    primary: '#0058bc',
    error: '#ba1a1a',
};
export default function ReasonModal({ visible, title, placeholder, value, submitLabel, danger = true, onChangeText, onCancel, onSubmit, }) {
    return (<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={COLORS.textMuted} multiline/>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: danger ? COLORS.error : COLORS.primary }]} onPress={onSubmit}>
              <Text style={styles.submitText}>{submitLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>);
}
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.48)',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        borderRadius: 18,
        backgroundColor: COLORS.surface,
        padding: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 12,
    },
    input: {
        minHeight: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#f8fafc',
        color: COLORS.text,
        padding: 12,
        textAlignVertical: 'top',
        fontSize: 14,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    cancelBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        color: COLORS.textMuted,
        fontWeight: '800',
    },
    submitBtn: {
        flex: 1,
        minHeight: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        color: '#fff',
        fontWeight: '900',
    },
});
