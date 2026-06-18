import api from './api';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// ─── Tours ───────────────────────────────────────────────────────────────────
export const tourService = {
  getAll: (search?: string) => api.get('/tours', { params: { search } }),
  getById: (id: number) => api.get(`/tours/${id}`),
  getPending: () => api.get('/tours/pending'),
  getMyTours: () => api.get('/tours/my-tours'),
  create: (data: any) => api.post('/tours', data),
  update: (id: number, data: any) => api.put(`/tours/${id}`, data),
  delete: (id: number) => api.delete(`/tours/${id}`),
  approve: (id: number) => api.put(`/tours/${id}/approve`),
  reject: (id: number, rejectReason: string) =>
    api.put(`/tours/${id}/reject`, { rejectReason }),
  addReview: (tourId: number, rating: number, comment: string) =>
    api.post(`/tours/${tourId}/reviews`, { rating, comment }),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingService = {
  create: (tourId: number, numPeople: number) =>
    api.post('/bookings', { tourId, numPeople }),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  cancel: (id: number) => api.put(`/bookings/${id}/cancel`),
  getProviderBookings: () => api.get('/bookings/provider'),
  getAllBookings: () => api.get('/bookings'),
  updateStatus: (
    id: number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => api.put(`/bookings/${id}/status`, { status }),
};

// ─── Favorites ───────────────────────────────────────────────────────────────
export const favoriteService = {
  getAll: () => api.get('/favorites'),
  add: (tourId: number) => api.post('/favorites', { tourId }),
  remove: (tourId: number) => api.delete(`/favorites/${tourId}`),
  check: (tourId: number) => api.get(`/favorites/check/${tourId}`),
};

// ─── Activities ──────────────────────────────────────────────────────────────
export const activityService = {
  getByTour: (tourId: number) => api.get(`/activities/tour/${tourId}`),
  getById: (id: number) => api.get(`/activities/${id}`),
  create: (data: any) => api.post('/activities', data),
  update: (id: number, data: any) => api.put(`/activities/${id}`, data),
  delete: (id: number) => api.delete(`/activities/${id}`),
};

// ─── Guides ──────────────────────────────────────────────────────────────────
export const guideService = {
  getAll: () => api.get('/guides'),
  getById: (id: number) => api.get(`/guides/${id}`),
  create: (data: any) => api.post('/guides', data),
  update: (id: number, data: any) => api.put(`/guides/${id}`, data),
  delete: (id: number) => api.delete(`/guides/${id}`),
};

// ─── Contacts ────────────────────────────────────────────────────────────────
export const contactService = {
  create: (subject: string, message: string) =>
    api.post('/contacts', { subject, message }),
  getMyContacts: () => api.get('/contacts/my-contacts'),
  getAll: () => api.get('/contacts'),
  reply: (id: number, reply: string) =>
    api.put(`/contacts/${id}/reply`, { reply }),
};

// ─── Friends ─────────────────────────────────────────────────────────────────
export const friendService = {
  search: (keyword: string) =>
    api.get('/friends/search', { params: { keyword } }),
  getFriends: () => api.get('/friends'),
  getRequests: () => api.get('/friends/requests'),
  sendRequest: (receiverId: number) =>
    api.post('/friends/request', { receiverId }),
  accept: (id: number) => api.put(`/friends/${id}/accept`),
  reject: (id: number) => api.put(`/friends/${id}/reject`),
  remove: (id: number) => api.delete(`/friends/${id}`),
};
