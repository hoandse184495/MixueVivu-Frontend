import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from './constants';
import { styles } from './styles';

export default function HomeSearchFilters({
    keyword,
    appliedFilters,
    colors,
    onKeywordChange,
    onSearch,
    onClearKeyword,
}) {
    return (
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm điểm đến hoặc tour..."
              placeholderTextColor={COLORS.textMuted}
              value={keyword}
              onChangeText={onKeywordChange}
              onSubmitEditing={() => onSearch(keyword, appliedFilters)}
              returnKeyType="search"
            />
            {keyword.length > 0 ? (
              <TouchableOpacity onPress={onClearKeyword}>
                <Text style={{ fontSize: 16, color: COLORS.textMuted }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => onSearch(keyword, appliedFilters)}>
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
        </View>
    );
}
