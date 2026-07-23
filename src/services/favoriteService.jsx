import api from '../api/api';
import { normalizeFavoriteCheckResponse, normalizeFavoriteResponse, } from './serviceHelpers';
export const favoriteService = {
    getAll: async () => normalizeFavoriteResponse(await api.get('/favorites')),
    add: (tourId) => api.post('/favorites', { tourId }),
    remove: (tourId) => api.delete(`/favorites/${tourId}`),
    check: async (tourId) => normalizeFavoriteCheckResponse(await api.get(`/favorites/check/${tourId}`)),
};
