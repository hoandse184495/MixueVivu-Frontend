import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { friendService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    successLight: '#e6f4ee',
    error: '#ba1a1a',
    errorLight: '#fdecea',
};
export default function FriendScreen({ navigation }) {
    const { colors } = useAppTheme();
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('friends');
    const [keyword, setKeyword] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [sentRequestIds, setSentRequestIds] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const fetchFriends = useCallback(async () => {
        try {
            setLoading(true);
            const [friendsRes, requestsRes] = await Promise.all([
                friendService.getFriends(),
                friendService.getRequests(),
            ]);
            setFriends(friendsRes.data.data || []);
            setRequests(requestsRes.data.data || []);
        }
        catch (e) {
            Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const loadCurrentUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                setCurrentUserId(JSON.parse(storedUser).id);
            }
        };
        loadCurrentUser();
        fetchFriends();
    }, []);
    const handleSearch = async () => {
        if (!keyword.trim()) {
            setHasSearched(false);
            setSearchResults([]);
            return;
        }
        try {
            setLoading(true);
            setHasSearched(true);
            const res = await friendService.search(keyword);
            setSearchResults(res.data.data || []);
        }
        catch (_a) {
            setSearchResults([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAccept = async (id) => {
        try {
            await friendService.accept(id);
            Alert.alert('Thành công', 'Đã chấp nhận lời mời kết bạn');
            fetchFriends();
        }
        catch (_a) {
            Alert.alert('Lỗi', 'Không thể chấp nhận lời mời');
        }
    };
    const handleReject = async (id) => {
        try {
            await friendService.reject(id);
            fetchFriends();
        }
        catch (_a) {
            Alert.alert('Lỗi', 'Không thể từ chối lời mời');
        }
    };
    const handleSendRequest = async (receiverId) => {
        var _a, _b;
        try {
            await friendService.sendRequest(receiverId);
            setSentRequestIds((current) => current.includes(receiverId) ? current : [...current, receiverId]);
            Alert.alert('Đã gửi', 'Lời mời kết bạn đã được gửi!');
        }
        catch (e) {
            Alert.alert('Lỗi', ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Không thể gửi lời mời');
        }
    };
    const getInitial = (name) => (name ? name[0].toUpperCase() : 'U');
    const renderAvatar = (avatar, name, backgroundColor = COLORS.primary) => (<View style={[styles.avatar, { backgroundColor }]}>
      {avatar ? (<Image source={{ uri: avatar }} style={styles.avatarImage}/>) : (<Text style={styles.avatarText}>{getInitial(name)}</Text>)}
    </View>);
    const renderFriend = ({ item }) => {
        const name = item.friendName || item.fullName || item.senderName;
        const email = item.friendEmail || item.email || item.senderEmail;
        return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
        {renderAvatar(item.avatar, name)}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{name || 'Người dùng'}</Text>
          <Text style={[styles.cardEmail, { color: colors.textMuted }]}>{email || ''}</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => {
                Alert.alert('Xóa bạn bè', 'Bạn muốn xóa người này khỏi danh sách bạn bè?', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive', onPress: () => friendService.remove(item.id).then(fetchFriends) },
                ]);
            }}>
          <Text style={{ color: COLORS.error, fontSize: 12, fontWeight: '700' }}>Xóa</Text>
        </TouchableOpacity>
      </View>);
    };
    const renderRequest = ({ item }) => (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
      {renderAvatar(item.avatar, item.senderName, '#894d00')}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]}>{item.senderName || 'Người dùng'}</Text>
        <Text style={[styles.cardEmail, { color: colors.textMuted }]}>{item.senderEmail || ''}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
          <Text style={styles.acceptBtnText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
          <Text style={styles.rejectBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>);
    const renderSearchResult = ({ item }) => {
        const isFriend = item.friendStatus === 'accepted';
        const isPending = item.friendStatus === 'pending';
        const isSent = sentRequestIds.includes(item.id) ||
            (isPending && Number(item.friendSenderId) === Number(currentUserId));
        const isIncoming = isPending && Number(item.friendReceiverId) === Number(currentUserId);
        const disabled = isFriend || isSent || isIncoming;
        const buttonLabel = isFriend
            ? 'Bạn bè'
            : isSent
                ? 'Đã gửi'
                : isIncoming
                    ? 'Đang chờ'
                    : '+ Kết bạn';
        return (<View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border + '30' }]}>
        {renderAvatar(item.avatar, item.fullName, COLORS.success)}
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{item.fullName || 'Người dùng'}</Text>
          <Text style={[styles.cardEmail, { color: colors.textMuted }]}>{item.email || ''}</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, disabled && styles.addBtnSent]} onPress={() => handleSendRequest(item.id)} disabled={disabled}>
          <Text style={[styles.addBtnText, disabled && styles.addBtnSentText]}>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>);
    };
    const TABS = [
        { key: 'friends', label: `Bạn bè (${friends.length})` },
        { key: 'requests', label: `Lời mời (${requests.length})` },
        { key: 'search', label: 'Tìm kiếm' },
    ];
    const listData = activeTab === 'friends' ? friends :
        activeTab === 'requests' ? requests :
            searchResults;
    const refreshCurrentTab = () => {
        if (activeTab === 'search') {
            if (hasSearched) {
                handleSearch();
            }
            return;
        }
        fetchFriends();
    };
    return (<SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border + '40' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>👥 Bạn bè</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border + '50' }]}>
        {TABS.map((tab) => (<TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator}/>}
          </TouchableOpacity>))}
      </View>

      {activeTab === 'search' && (<View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm bạn bè..." placeholderTextColor={COLORS.textMuted} value={keyword} onChangeText={(value) => {
                setKeyword(value);
                setHasSearched(false);
                setSearchResults([]);
            }} onSubmitEditing={handleSearch} returnKeyType="search"/>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Tìm</Text>
          </TouchableOpacity>
        </View>)}

      {loading && listData.length === 0 ? (<ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }}/>) : (<FlatList data={listData} keyExtractor={(item) => { var _a; return (_a = item.id) === null || _a === void 0 ? void 0 : _a.toString(); }} renderItem={activeTab === 'friends' ? renderFriend :
                activeTab === 'requests' ? renderRequest :
                    renderSearchResult} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false} onRefresh={refreshCurrentTab} refreshing={loading} ListEmptyComponent={<View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40 }}>👥</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {activeTab === 'friends' ? 'Chưa có bạn bè' :
                    activeTab === 'requests' ? 'Không có lời mời nào' :
                        hasSearched ? 'Không tìm thấy người dùng phù hợp' : 'Nhập từ khóa rồi bấm Tìm để kết bạn'}
              </Text>
            </View>}/>)}
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
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    tabBar: {
        flexDirection: 'row', backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.border + '50',
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
    tabActive: {},
    tabLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
    tabLabelActive: { color: COLORS.primary, fontWeight: '700' },
    tabIndicator: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, backgroundColor: COLORS.primary, borderRadius: 2,
    },
    searchBox: {
        flexDirection: 'row', padding: 12, gap: 8,
        backgroundColor: COLORS.surface,
    },
    searchInput: {
        flex: 1, backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12, paddingHorizontal: 14, height: 44,
        fontSize: 14, color: COLORS.text,
    },
    searchBtn: {
        backgroundColor: COLORS.primary, borderRadius: 12,
        paddingHorizontal: 16, height: 44, justifyContent: 'center',
    },
    card: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: COLORS.surface, borderRadius: 16,
        padding: 14, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    },
    avatar: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    avatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
    avatarImage: { width: '100%', height: '100%' },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    cardEmail: { fontSize: 12, color: COLORS.textMuted },
    removeBtn: {
        borderWidth: 1, borderColor: COLORS.error + '50',
        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    },
    requestActions: { flexDirection: 'row', gap: 8 },
    acceptBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center',
    },
    acceptBtnText: { color: COLORS.success, fontWeight: '800', fontSize: 14 },
    rejectBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.errorLight, alignItems: 'center', justifyContent: 'center',
    },
    rejectBtnText: { color: COLORS.error, fontWeight: '800', fontSize: 12 },
    addBtn: {
        backgroundColor: COLORS.primaryLight, borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 8,
    },
    addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
    addBtnSent: { backgroundColor: COLORS.successLight },
    addBtnSentText: { color: COLORS.success },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12, fontWeight: '600' },
});
