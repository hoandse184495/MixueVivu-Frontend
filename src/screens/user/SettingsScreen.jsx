import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
export default function SettingsScreen({ navigation }) {
    const { colors, isDark, mode, setMode, toggleTheme } = useAppTheme();
    const renderModeButton = (nextMode, label, icon) => {
        const active = mode === nextMode;
        return (<TouchableOpacity style={[
                styles.modeButton,
                {
                    backgroundColor: active ? colors.primaryLight : colors.surfaceContainerLow,
                    borderColor: active ? colors.primary : colors.border,
                },
            ]} onPress={() => setMode(nextMode)} activeOpacity={0.85}>
        <Text style={styles.modeIcon}>{icon}</Text>
        <Text style={[styles.modeLabel, { color: active ? colors.primary : colors.text }]}>
          {label}
        </Text>
      </TouchableOpacity>);
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: `${colors.border}40` }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Cài đặt</Text>
        <View style={styles.headerSpacer}/>
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Chế độ tối</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                Đổi giao diện hồ sơ và cài đặt sang nền tối.
              </Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#ffffff"/>
          </View>

          <View style={styles.modeGrid}>
            {renderModeButton('light', 'Sáng', '☀️')}
            {renderModeButton('dark', 'Tối', '🌙')}
          </View>
        </View>
      </View>
    </SafeAreaView>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: {
        fontSize: 32,
        lineHeight: 34,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        padding: 16,
    },
    section: {
        borderRadius: 18,
        padding: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    settingTextWrap: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    modeGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },
    modeButton: {
        flex: 1,
        minHeight: 76,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    modeIcon: {
        fontSize: 22,
    },
    modeLabel: {
        fontSize: 14,
        fontWeight: '800',
    },
});
