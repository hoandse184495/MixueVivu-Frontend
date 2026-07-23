import { StyleSheet, TextInput, View } from 'react-native';
export default function SearchBox({ value, onChangeText, placeholder, borderColor = '#c1c6d7', textColor = '#191c1e', mutedColor = '#717786', backgroundColor = '#ffffff', }) {
    return (<View style={[styles.wrap, { backgroundColor, borderBottomColor: `${borderColor}66` }]}>
      <TextInput style={[styles.input, { borderColor, color: textColor }]} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={mutedColor} autoCapitalize="none"/>
    </View>);
}
const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    input: {
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: '600',
    },
});
