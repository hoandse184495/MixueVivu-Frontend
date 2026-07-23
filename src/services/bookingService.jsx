import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { normalizeBookingResponse } from './serviceHelpers';
const getStoredUser = async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
export const bookingService = {
    create: async (tourId, numPeople) => {
        const user = await getStoredUser();
        return api.post('/bookings', {
            tourId,
            fullName: (user === null || user === void 0 ? void 0 : user.fullName) || '',
            phone: (user === null || user === void 0 ? void 0 : user.phone) || '',
            numberOfPeople: numPeople,
        });
    },
    getMyBookings: async () => normalizeBookingResponse(await api.get('/bookings/my-bookings')),
    cancel: async (id) => normalizeBookingResponse(await api.put(`/bookings/${id}/cancel`)),
    getProviderBookings: async () => normalizeBookingResponse(await api.get('/bookings/provider')),
    getAllBookings: async () => normalizeBookingResponse(await api.get('/bookings')),
    updateStatus: async (id, status) => normalizeBookingResponse(await api.put(`/bookings/${id}/status`, { status })),
    providerConfirmBooking: async (id) => normalizeBookingResponse(await api.put(`/bookings/${id}/confirm`)),
    providerRejectBooking: async (id, reason) => normalizeBookingResponse(await api.put(`/bookings/${id}/reject`, { reason })),
    complete: async (id) => normalizeBookingResponse(await api.put(`/bookings/${id}/complete`)),
    providerCompleteBooking: async (id) => normalizeBookingResponse(await api.put(`/bookings/${id}/complete`)),
};
