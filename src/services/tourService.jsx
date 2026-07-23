import api from '../api/api';
import { cleanParams, mapTourPayload, normalizeTourResponse, } from './serviceHelpers';
export const tourService = {
    getAll: (filters = {}) => api
        .get('/tours', {
        params: cleanParams(filters),
    })
        .then(normalizeTourResponse),
    getById: async (id) => normalizeTourResponse(await api.get(`/tours/${id}`)),
    getPending: async () => normalizeTourResponse(await api.get('/tours/pending')),
    getMyTours: async () => normalizeTourResponse(await api.get('/tours/my-tours')),
    create: (data) => api.post('/tours', mapTourPayload(data)),
    update: (id, data) => api.put(`/tours/${id}`, mapTourPayload(data)),
    delete: (id) => api.delete(`/tours/${id}`),
    approve: (id) => api.put(`/tours/${id}/approve`),
    reject: (id, rejectReason) => api.put(`/tours/${id}/reject`, { rejectReason }),
    resubmit: (id) => api.put(`/tours/${id}/resubmit`),
    addReview: (tourId, rating, comment) => api.post(`/tours/${tourId}/reviews`, { rating, comment }),
};
