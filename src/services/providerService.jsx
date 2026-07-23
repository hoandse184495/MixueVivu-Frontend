import api from '../api/api';
export const providerService = {
    getProviderStats: () => api.get('/provider/stats'),
    getProviderRevenueByMonth: () => api.get('/provider/stats/revenue'),
};
