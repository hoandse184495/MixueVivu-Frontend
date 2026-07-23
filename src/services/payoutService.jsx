import api from '../api/api';
import { normalizePayoutResponse } from './serviceHelpers';
export const payoutService = {
    getMyPayouts: async () => normalizePayoutResponse(await api.get('/payouts/my-payouts')),
    getEligibleBookings: () => api.get('/payouts/eligible'),
    getAllPayouts: async () => normalizePayoutResponse(await api.get('/payouts')),
    createPayout: async (data) => normalizePayoutResponse(await api.post('/payouts', data)),
    confirmPayout: async (id) => normalizePayoutResponse(await api.put(`/payouts/${id}/confirm`)),
};
