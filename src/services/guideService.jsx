import api from '../api/api';
import { mapGuidePayload, normalizeGuideResponse } from './serviceHelpers';
export const guideService = {
    getAll: async () => normalizeGuideResponse(await api.get('/guides')),
    getById: async (id) => normalizeGuideResponse(await api.get(`/guides/${id}`)),
    create: (data) => api.post('/guides', mapGuidePayload(data)),
    update: (id, data) => api.put(`/guides/${id}`, mapGuidePayload(data)),
    delete: (id) => api.delete(`/guides/${id}`),
};
