import api from '../api/api';
import { mapActivityPayload, normalizeActivity, normalizeActivityResponse, } from './serviceHelpers';
export { normalizeActivity };
export const activityService = {
    getByTour: async (tourId) => normalizeActivityResponse(await api.get(`/activities/tour/${tourId}`)),
    getById: async (id) => normalizeActivityResponse(await api.get(`/activities/${id}`)),
    create: (data) => api.post('/activities', mapActivityPayload(data)),
    update: (id, data) => api.put(`/activities/${id}`, mapActivityPayload(data)),
    delete: (id) => api.delete(`/activities/${id}`),
};
