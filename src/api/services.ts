import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TourFilters = {
  search?: string;
  location?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  startDate?: string;
  minAvailableSlots?: string;
};

const cleanParams = (filters: Record<string, string | undefined>) =>
  Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, value?.trim()])
      .filter(([, value]) => value)
  );

const normalizeFavoriteResponse = (response: any) => {
  response.data.data = (response.data.data || []).map((row: any) => {
    const { favoriteId, favoriteCreatedAt, ...tour } = row;

    return {
      id: favoriteId,
      tourId: tour.id,
      createdAt: favoriteCreatedAt,
      tour,
    };
  });

  return response;
};

const normalizeFavoriteCheckResponse = (response: any) => {
  response.data.data = {
    ...response.data.data,
    isFavorited: Boolean(response.data.data?.isFavorite),
  };

  return response;
};

const normalizeGuide = (guide: any) => ({
  ...guide,
  name: guide.name || guide.fullName,
});

const normalizeGuideResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeGuide)
    : normalizeGuide(data);

  return response;
};

const normalizeActivity = (activity: any, index: number) => ({
  ...activity,
  day: activity.day || 1,
  time: activity.time || activity.activityTime,
  order: activity.order || index + 1,
});

const normalizeActivityResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeActivity)
    : normalizeActivity(data, 0);

  return response;
};

const normalizeBooking = (booking: any) => ({
  ...booking,
  numPeople: booking.numPeople ?? booking.numberOfPeople,
  tourTitle: booking.tourTitle ?? booking.title,
  tourImage: booking.tourImage ?? booking.image,
  tourLocation: booking.tourLocation ?? booking.location,
  tourDuration: booking.tourDuration ?? booking.duration,
  tourPrice: booking.tourPrice ?? booking.price,
});

const normalizeBookingResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeBooking)
    : normalizeBooking(data);

  return response;
};

const normalizeFriendRequest = (request: any) => ({
  ...request,
  id: request.id ?? request.requestId,
  senderName: request.senderName ?? request.fullName,
  senderEmail: request.senderEmail ?? request.email,
});

const normalizeFriendRequestResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeFriendRequest)
    : normalizeFriendRequest(data);

  return response;
};

const normalizeFriend = (friend: any) => ({
  ...friend,
  id: friend.id ?? friend.friendRequestId,
  friendName: friend.friendName ?? friend.fullName,
  friendEmail: friend.friendEmail ?? friend.email,
});

const normalizeFriendResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeFriend)
    : normalizeFriend(data);

  return response;
};

const mapGuidePayload = (data: any) => ({
  ...data,
  fullName: data.fullName || data.name,
});

const getStoredUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const tourService = {
  getAll: (filters: TourFilters = {}) =>
    api.get('/tours', {
      params: cleanParams(filters),
    }),
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

export const bookingService = {
  create: async (tourId: number, numPeople: number) => {
    const user = await getStoredUser();

    return api.post('/bookings', {
      tourId,
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      numberOfPeople: numPeople,
    });
  },
  getMyBookings: async () =>
    normalizeBookingResponse(await api.get('/bookings/my-bookings')),
  cancel: (id: number) => api.put(`/bookings/${id}/cancel`),
  getProviderBookings: () => api.get('/bookings/provider'),
  getAllBookings: () => api.get('/bookings'),
  updateStatus: (
    id: number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => api.put(`/bookings/${id}/status`, { status }),
};

export const favoriteService = {
  getAll: async () => normalizeFavoriteResponse(await api.get('/favorites')),
  add: (tourId: number) => api.post('/favorites', { tourId }),
  remove: (tourId: number) => api.delete(`/favorites/${tourId}`),
  check: async (tourId: number) =>
    normalizeFavoriteCheckResponse(await api.get(`/favorites/check/${tourId}`)),
};

export const activityService = {
  getByTour: async (tourId: number) =>
    normalizeActivityResponse(await api.get(`/activities/tour/${tourId}`)),
  getById: async (id: number) =>
    normalizeActivityResponse(await api.get(`/activities/${id}`)),
  create: (data: any) => api.post('/activities', data),
  update: (id: number, data: any) => api.put(`/activities/${id}`, data),
  delete: (id: number) => api.delete(`/activities/${id}`),
};

export const guideService = {
  getAll: async () => normalizeGuideResponse(await api.get('/guides')),
  getById: async (id: number) =>
    normalizeGuideResponse(await api.get(`/guides/${id}`)),
  create: (data: any) => api.post('/guides', mapGuidePayload(data)),
  update: (id: number, data: any) =>
    api.put(`/guides/${id}`, mapGuidePayload(data)),
  delete: (id: number) => api.delete(`/guides/${id}`),
};

export const contactService = {
  create: (subject: string, message: string) =>
    api.post('/contacts', { subject, message }),
  getMyContacts: () => api.get('/contacts/my-contacts'),
  getAll: () => api.get('/contacts'),
  reply: (id: number, reply: string) =>
    api.put(`/contacts/${id}/reply`, { reply, status: 'replied' }),
};

export const friendService = {
  search: (keyword: string) =>
    api.get('/friends/search', {
      params: cleanParams({ keyword }),
    }),
  getFriends: async () => normalizeFriendResponse(await api.get('/friends')),
  getRequests: async () =>
    normalizeFriendRequestResponse(await api.get('/friends/requests')),
  sendRequest: (receiverId: number) =>
    api.post('/friends/request', { receiverId }),
  accept: (id: number) => api.put(`/friends/${id}/accept`),
  reject: (id: number) => api.put(`/friends/${id}/reject`),
  remove: (id: number) => api.delete(`/friends/${id}`),
};
