import api from '../api/api';
import { normalizePaymentResponse } from './serviceHelpers';
export const paymentService = {
    getMyPayments: async () => normalizePaymentResponse(await api.get('/payments/my-payments')),
    getAllPayments: async () => normalizePaymentResponse(await api.get('/payments')),
    submitPayment: async (id, data) => normalizePaymentResponse(await api.put(`/payments/${id}/submit`, data)),
    confirmPayment: async (id) => normalizePaymentResponse(await api.put(`/payments/${id}/confirm`)),
    refundPayment: async (id, data = {}) => normalizePaymentResponse(await api.put(`/payments/${id}/refund`, data)),
};
