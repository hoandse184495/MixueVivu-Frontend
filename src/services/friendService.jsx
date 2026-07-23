import api from '../api/api';
import { cleanParams, normalizeFriendRequestResponse, normalizeFriendResponse, } from './serviceHelpers';
export const friendService = {
    search: (keyword) => api.get('/friends/search', {
        params: cleanParams({ keyword }),
    }),
    getFriends: async () => normalizeFriendResponse(await api.get('/friends')),
    getRequests: async () => normalizeFriendRequestResponse(await api.get('/friends/requests')),
    sendRequest: (receiverId) => api.post('/friends/request', { receiverId }),
    accept: (id) => api.put(`/friends/${id}/accept`),
    reject: (id) => api.put(`/friends/${id}/reject`),
    remove: (id) => api.delete(`/friends/${id}`),
};
