import { useEffect, useState, useCallback } from 'react';
import { Alert, SafeAreaView, ScrollView, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryService, notificationService, tourService } from '../../services';
import { useAppTheme } from '../../theme/ThemeContext';
import { prefetchTourImages } from '../../components/TourImage';
import { CATEGORIES } from './home/constants';
import { styles } from './home/styles';
import CategoryChips from './home/CategoryChips';
import HomeOverview from './home/HomeOverview';
import HomeSearchFilters from './home/HomeSearchFilters';
import NotificationModal, { getNotificationTargetTab } from './home/NotificationModal';
import TourListSection from './home/TourListSection';
import UserHomeHeader from './home/UserHomeHeader';

export default function UserHomeScreen({ navigation }) {
    const { colors } = useAppTheme();
    const [tours, setTours] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(CATEGORIES);
    const [appliedFilters, setAppliedFilters] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [notificationError, setNotificationError] = useState('');
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);

    const fetchTours = useCallback(async (search = '', filters = {}) => {
        try {
            setLoading(true);
            const res = await tourService.getAll({
                ...filters,
                search: search || undefined,
            });
            const nextTours = res.data.data || [];
            setTours(nextTours);
            prefetchTourImages(nextTours.map((tour) => tour.image));
        }
        catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Không thể tải tour');
        }
        finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getAll();
            const apiCategories = res.data.data.map((cat) => {
                const categorySlug = String(cat.slug || '').toLowerCase();
                const categoryName = String(cat.name || '').toLowerCase();
                const found = CATEGORIES.find((c) =>
                    c.value.toLowerCase() === categorySlug ||
                    c.label.toLowerCase() === categoryName
                );

                return {
                    label: cat.name,
                    value: cat.name,
                    icon: found ? found.icon : '✨',
                };
            });
            setCategories([{ label: 'Tất cả', value: 'all', icon: '🌟' }, ...apiCategories]);
        }
        catch (e) {
            console.log('Error fetching categories:', e);
        }
    };

    const fetchNotifications = useCallback(async () => {
        try {
            setNotificationError('');
            const [listRes, countRes] = await Promise.all([
                notificationService.getAll(),
                notificationService.getUnreadCount(),
            ]);
            setNotifications(listRes.data.data || []);
            const nextUnreadCount = countRes.data.data?.count || 0;
            setUnreadCount(nextUnreadCount);
            return nextUnreadCount;
        }
        catch (error) {
            console.log('Error fetching notifications:', error);
            setNotificationError('Không thể tải thông báo. Vui lòng thử lại.');
            return 0;
        }
    }, []);

    useEffect(() => {
        const getUserFromStorage = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        };

        getUserFromStorage();
        fetchCategories();
        fetchTours();
        fetchNotifications();
    }, [fetchNotifications, fetchTours]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchNotifications();
        });

        return unsubscribe;
    }, [navigation, fetchNotifications]);

    const openNotifications = async () => {
        setNotificationModalVisible(true);
        setNotificationLoading(true);
        await fetchNotifications();
        setNotificationLoading(false);
    };

    const markAllNotificationsAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
        }
        catch (error) {
            console.log('Error marking all notifications as read:', error);
            Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo đã đọc');
        }
    };

    const openNotificationItem = async (item) => {
        if (!item.isRead) {
            setUnreadCount((current) => Math.max(current - 1, 0));
            setNotifications((current) => current.map((notification) =>
                notification.id === item.id
                    ? { ...notification, isRead: true }
                    : notification
            ));

            try {
                await notificationService.markAsRead(item.id);
            }
            catch (error) {
                console.log('Error marking notification as read:', error);
            }
        }

        const targetTab = getNotificationTargetTab(item);
        if (targetTab) {
            setNotificationModalVisible(false);
            navigation.getParent?.()?.navigate(targetTab);
        }
    };

    const retryNotifications = async () => {
        setNotificationLoading(true);
        await fetchNotifications();
        setNotificationLoading(false);
    };

    const selectCategory = (cat) => {
        const category = cat.value === 'all' ? undefined : cat.value;
        const filters = { ...appliedFilters, category };
        setSelectedCategory(cat.value);
        setAppliedFilters(filters);
        fetchTours(keyword, filters);
    };

    const openTour = (tour) => {
        navigation.navigate('TourDetail', { tour });
    };

    const firstName = user?.fullName?.trim().split(/\s+/).pop() || 'bạn';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
          <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
            <UserHomeHeader
              user={user}
              colors={colors}
              unreadCount={unreadCount}
              onOpenNotifications={openNotifications}
            />

            <HomeOverview
              firstName={firstName}
            />

            <HomeSearchFilters
              keyword={keyword}
              appliedFilters={appliedFilters}
              colors={colors}
              onKeywordChange={setKeyword}
              onSearch={fetchTours}
              onClearKeyword={() => {
                setKeyword('');
                fetchTours('', appliedFilters);
              }}
            />

            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={selectCategory}
            />

            <TourListSection
              loading={loading}
              tours={tours}
              colors={colors}
              onOpenTour={openTour}
            />

            <View style={{ height: 100 }} />
          </ScrollView>

          <NotificationModal
            visible={notificationModalVisible}
            unreadCount={unreadCount}
            notifications={notifications}
            loading={notificationLoading}
            error={notificationError}
            onClose={() => setNotificationModalVisible(false)}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onOpenNotification={openNotificationItem}
            onRetry={retryNotifications}
          />
        </SafeAreaView>
    );
}
