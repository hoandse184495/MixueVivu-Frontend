import api from '../api/api';
import { getUnreadCountValue, normalizeNotificationResponse, } from './serviceHelpers';
export const notificationService = {
    getAll: async () => normalizeNotificationResponse(await api.get('/notifications')),
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        response.data.data = {
            ...(typeof response.data.data === 'object' ? response.data.data : {}),
            count: getUnreadCountValue(response.data.data),
        };
        return response;
    },
    markAsRead: async (id) => normalizeNotificationResponse(await api.put(`/notifications/${id}/read`)),
    markAllAsRead: () => api.put('/notifications/read-all'),
};
