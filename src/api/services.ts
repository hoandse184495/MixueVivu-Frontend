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

const normalizeTour = (tour: any) => ({
  ...tour,
  category:
    tour.category ??
    tour.categoryName ??
    tour.Categories?.name ??
    tour.Category?.name ??
    tour.categoryInfo?.name,
  categoryId:
    tour.categoryId ??
    tour.category_id ??
    tour.Categories?.id ??
    tour.Category?.id ??
    tour.categoryInfo?.id,
});

const normalizeTourResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeTour)
    : normalizeTour(data);

  return response;
};

const getActivityDay = (activity: any) => {
  if (activity.day) return Number(activity.day) || 1;

  const titleDay = String(activity.title || '').match(/ng[aà]y\s*(\d+)/i);
  return titleDay ? Number(titleDay[1]) || 1 : 1;
};

export const normalizeActivity = (activity: any, index = 0) => ({
  ...activity,
  tourId: activity.tourId ?? activity.tour_id,
  day: getActivityDay(activity),
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
  providerId: booking.providerId ?? booking.Tours?.providerId,
  providerName: booking.providerName ?? booking.Tours?.Users?.companyName ?? booking.Tours?.Users?.fullName,
  providerEmail: booking.providerEmail ?? booking.Tours?.Users?.email,
  tourAvailableSlots:
    booking.tourAvailableSlots ?? booking.Tours?.availableSlots,
});

const normalizeBookingResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeBooking)
    : normalizeBooking(data);

  return response;
};

const normalizePayment = (payment: any) => ({
  ...payment,
  bookingId: payment.bookingId ?? payment.booking_id ?? payment.Bookings?.id,
  userFullName: payment.userFullName ?? payment.Users?.fullName,
  userEmail: payment.userEmail ?? payment.Users?.email,
  bookingFullName: payment.bookingFullName ?? payment.Bookings?.fullName,
  bookingStatus: payment.bookingStatus ?? payment.Bookings?.status,
  paidAt: payment.paidAt ?? payment.paid_at,
  tourTitle:
    payment.tourTitle ??
    payment.Bookings?.Tours?.title ??
    payment.Bookings?.Tours?.Tours?.title,
});

const normalizePaymentResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizePayment)
    : normalizePayment(data);

  return response;
};

const normalizePayout = (payout: any) => {
  const amount = Number(payout.amount || 0);
  const commissionAmount = Number(payout.commissionAmount || 0);

  return {
    ...payout,
    providerId: payout.providerId ?? payout.Users?.id,
    providerName: payout.providerName ?? payout.Users?.fullName,
    providerEmail: payout.providerEmail ?? payout.Users?.email,
    bookingFullName: payout.bookingFullName ?? payout.Bookings?.fullName,
    tourTitle: payout.tourTitle ?? payout.Bookings?.Tours?.title,
    commissionRate:
      payout.commissionRate ??
      (amount > 0 ? Math.round((commissionAmount / amount) * 100) : 0),
  };
};

const normalizePayoutResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizePayout)
    : normalizePayout(data);

  return response;
};

const normalizeNotification = (notification: any) => ({
  ...notification,
  id: notification.id ?? notification.notificationId,
  userId: notification.userId ?? notification.user_id,
  bookingId: notification.bookingId ?? notification.booking_id,
  tourId: notification.tourId ?? notification.tour_id,
  paymentId: notification.paymentId ?? notification.payment_id,
  status: notification.status ?? notification.notificationStatus,
  isRead: Boolean(notification.isRead ?? notification.is_read),
  createdAt: notification.createdAt ?? notification.created_at,
});

const normalizeNotificationResponse = (response: any) => {
  const data = response.data.data;
  response.data.data = Array.isArray(data)
    ? data.map(normalizeNotification)
    : normalizeNotification(data);

  return response;
};

const getUnreadCountValue = (data: any) =>
  Number(data?.count ?? data?.unreadCount ?? data?.unread_count ?? data ?? 0) || 0;

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

const mapTourPayload = (data: any) => ({
  ...data,
  category_id: data.category_id ?? data.categoryId,
});

const mapActivityPayload = (data: any) => ({
  ...data,
  tour_id: data.tour_id ?? data.tourId,
  activity_time: data.activity_time ?? data.activityTime,
});

const getStoredUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  registerProvider: (data: any) => api.post('/auth/register-provider', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const tourService = {
  getAll: (filters: TourFilters = {}) =>
    api
      .get('/tours', {
        params: cleanParams(filters),
      })
      .then(normalizeTourResponse),
  getById: async (id: number) => normalizeTourResponse(await api.get(`/tours/${id}`)),
  getPending: async () => normalizeTourResponse(await api.get('/tours/pending')),
  getMyTours: async () => normalizeTourResponse(await api.get('/tours/my-tours')),
  create: (data: any) => api.post('/tours', mapTourPayload(data)),
  update: (id: number, data: any) => api.put(`/tours/${id}`, mapTourPayload(data)),
  delete: (id: number) => api.delete(`/tours/${id}`),
  approve: (id: number) => api.put(`/tours/${id}/approve`),
  reject: (id: number, rejectReason: string) =>
    api.put(`/tours/${id}/reject`, { rejectReason }),
  resubmit: (id: number) => api.put(`/tours/${id}/resubmit`),
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
  cancel: async (id: number) =>
    normalizeBookingResponse(await api.put(`/bookings/${id}/cancel`)),
  getProviderBookings: async () =>
    normalizeBookingResponse(await api.get('/bookings/provider')),
  getAllBookings: async () =>
    normalizeBookingResponse(await api.get('/bookings')),
  updateStatus: async (
    id: number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => normalizeBookingResponse(await api.put(`/bookings/${id}/status`, { status })),
  providerConfirmBooking: async (id: number) =>
    normalizeBookingResponse(await api.put(`/bookings/${id}/confirm`)),
  providerRejectBooking: async (id: number) =>
    normalizeBookingResponse(await api.put(`/bookings/${id}/reject`)),
  complete: async (id: number) =>
    normalizeBookingResponse(await api.put(`/bookings/${id}/complete`)),
  providerCompleteBooking: async (id: number) =>
    normalizeBookingResponse(await api.put(`/bookings/${id}/complete`)),
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
  create: (data: any) => api.post('/activities', mapActivityPayload(data)),
  update: (id: number, data: any) => api.put(`/activities/${id}`, mapActivityPayload(data)),
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

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const paymentService = {
  getMyPayments: async () =>
    normalizePaymentResponse(await api.get('/payments/my-payments')),
  getAllPayments: async () =>
    normalizePaymentResponse(await api.get('/payments')),
  submitPayment: async (id: number, data: any) =>
    normalizePaymentResponse(await api.put(`/payments/${id}/submit`, data)),
  confirmPayment: async (id: number) =>
    normalizePaymentResponse(await api.put(`/payments/${id}/confirm`)),
  refundPayment: async (id: number) =>
    normalizePaymentResponse(await api.put(`/payments/${id}/refund`)),
};

export const notificationService = {
  getAll: async () => normalizeNotificationResponse(await api.get('/notifications')),
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    response.data.data = {
      ...(typeof response.data.data === 'object' ? response.data.data : {}),
      count: getUnreadCountValue(response.data.data),
    };

    return response;
  },
  markAsRead: async (id: number) =>
    normalizeNotificationResponse(await api.put(`/notifications/${id}/read`)),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const payoutService = {
  getMyPayouts: async () =>
    normalizePayoutResponse(await api.get('/payouts/my-payouts')),
  getEligibleBookings: () => api.get('/payouts/eligible'),
  getAllPayouts: async () =>
    normalizePayoutResponse(await api.get('/payouts')),
  createPayout: async (data: any) =>
    normalizePayoutResponse(await api.post('/payouts', data)),
  confirmPayout: async (id: number) =>
    normalizePayoutResponse(await api.put(`/payouts/${id}/confirm`)),
};

export const providerService = {
  getProviderStats: () => api.get('/provider/stats'),
  getProviderRevenueByMonth: () => api.get('/provider/stats/revenue'),
};

export const adminService = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  blockUser: (id: number) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id: number) => api.put(`/admin/users/${id}/unblock`),
  approveProvider: (id: number) => api.put(`/admin/providers/${id}/approve`),
  rejectProvider: (id: number, reason: string) =>
    api.put(`/admin/providers/${id}/reject`, { reason }),
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenueStats: () => api.get('/admin/stats/revenue'),
  getBookingStats: () => api.get('/admin/stats/bookings'),
  getTopTours: () => api.get('/admin/stats/top-tours'),
};
