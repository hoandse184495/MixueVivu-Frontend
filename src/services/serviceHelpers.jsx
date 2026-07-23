export const cleanParams = (filters) => Object.fromEntries(Object.entries(filters)
    .map(([key, value]) => [key, value === null || value === void 0 ? void 0 : value.trim()])
    .filter(([, value]) => value));
export const normalizeFavoriteResponse = (response) => {
    response.data.data = (response.data.data || []).map((row) => {
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
export const normalizeFavoriteCheckResponse = (response) => {
    var _a;
    const data = response.data.data || {};
    response.data.data = {
        ...data,
        isFavorited: Boolean(
            (_a = data.isFavorited) !== null && _a !== void 0
                ? _a
                : data.isFavorite
        ),
    };
    return response;
};
const normalizeGuide = (guide) => ({
    ...guide,
    name: guide.name || guide.fullName,
});
export const normalizeGuideResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeGuide)
        : normalizeGuide(data);
    return response;
};
const normalizeTour = (tour) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return ({
        ...tour,
        category: (_f = (_d = (_b = (_a = tour.category) !== null && _a !== void 0 ? _a : tour.categoryName) !== null && _b !== void 0 ? _b : (_c = tour.Categories) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : (_e = tour.Category) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : (_g = tour.categoryInfo) === null || _g === void 0 ? void 0 : _g.name,
        categoryId: (_o = (_l = (_j = (_h = tour.categoryId) !== null && _h !== void 0 ? _h : tour.category_id) !== null && _j !== void 0 ? _j : (_k = tour.Categories) === null || _k === void 0 ? void 0 : _k.id) !== null && _l !== void 0 ? _l : (_m = tour.Category) === null || _m === void 0 ? void 0 : _m.id) !== null && _o !== void 0 ? _o : (_p = tour.categoryInfo) === null || _p === void 0 ? void 0 : _p.id,
    });
};
export const normalizeTourResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeTour)
        : normalizeTour(data);
    return response;
};
const getActivityDay = (activity) => {
    if (activity.day)
        return Number(activity.day) || 1;
    const titleDay = String(activity.title || '').match(/ng[aà]y\s*(\d+)/i);
    return titleDay ? Number(titleDay[1]) || 1 : 1;
};
export const normalizeActivity = (activity, index = 0) => {
    var _a;
    return ({
        ...activity,
        tourId: (_a = activity.tourId) !== null && _a !== void 0 ? _a : activity.tour_id,
        day: getActivityDay(activity),
        time: activity.time || activity.activityTime,
        order: activity.order || index + 1,
    });
};
export const normalizeActivityResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeActivity)
        : normalizeActivity(data, 0);
    return response;
};
export const normalizeBooking = (booking) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    return ({
        ...booking,
        numPeople: (_a = booking.numPeople) !== null && _a !== void 0 ? _a : booking.numberOfPeople,
        tourTitle: (_b = booking.tourTitle) !== null && _b !== void 0 ? _b : booking.title,
        tourImage: (_c = booking.tourImage) !== null && _c !== void 0 ? _c : booking.image,
        tourLocation: (_d = booking.tourLocation) !== null && _d !== void 0 ? _d : booking.location,
        tourDuration: (_e = booking.tourDuration) !== null && _e !== void 0 ? _e : booking.duration,
        tourPrice: (_f = booking.tourPrice) !== null && _f !== void 0 ? _f : booking.price,
        providerId: (_g = booking.providerId) !== null && _g !== void 0 ? _g : (_h = booking.Tours) === null || _h === void 0 ? void 0 : _h.providerId,
        providerName: (_m = (_j = booking.providerName) !== null && _j !== void 0 ? _j : (_l = (_k = booking.Tours) === null || _k === void 0 ? void 0 : _k.Users) === null || _l === void 0 ? void 0 : _l.companyName) !== null && _m !== void 0 ? _m : (_p = (_o = booking.Tours) === null || _o === void 0 ? void 0 : _o.Users) === null || _p === void 0 ? void 0 : _p.fullName,
        providerEmail: (_q = booking.providerEmail) !== null && _q !== void 0 ? _q : (_s = (_r = booking.Tours) === null || _r === void 0 ? void 0 : _r.Users) === null || _s === void 0 ? void 0 : _s.email,
        tourAvailableSlots: (_t = booking.tourAvailableSlots) !== null && _t !== void 0 ? _t : (_u = booking.Tours) === null || _u === void 0 ? void 0 : _u.availableSlots,
    });
};
export const normalizeBookingResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeBooking)
        : normalizeBooking(data);
    return response;
};
export const normalizePayment = (payment) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    return ({
        ...payment,
        bookingId: (_b = (_a = payment.bookingId) !== null && _a !== void 0 ? _a : payment.booking_id) !== null && _b !== void 0 ? _b : (_c = payment.Bookings) === null || _c === void 0 ? void 0 : _c.id,
        userFullName: (_d = payment.userFullName) !== null && _d !== void 0 ? _d : (_e = payment.Users) === null || _e === void 0 ? void 0 : _e.fullName,
        userEmail: (_f = payment.userEmail) !== null && _f !== void 0 ? _f : (_g = payment.Users) === null || _g === void 0 ? void 0 : _g.email,
        bookingFullName: (_h = payment.bookingFullName) !== null && _h !== void 0 ? _h : (_j = payment.Bookings) === null || _j === void 0 ? void 0 : _j.fullName,
        bookingStatus: (_k = payment.bookingStatus) !== null && _k !== void 0 ? _k : (_l = payment.Bookings) === null || _l === void 0 ? void 0 : _l.status,
        paidAt: (_m = payment.paidAt) !== null && _m !== void 0 ? _m : payment.paid_at,
        tourTitle: (_r = (_o = payment.tourTitle) !== null && _o !== void 0 ? _o : (_q = (_p = payment.Bookings) === null || _p === void 0 ? void 0 : _p.Tours) === null || _q === void 0 ? void 0 : _q.title) !== null && _r !== void 0 ? _r : (_u = (_t = (_s = payment.Bookings) === null || _s === void 0 ? void 0 : _s.Tours) === null || _t === void 0 ? void 0 : _t.Tours) === null || _u === void 0 ? void 0 : _u.title,
    });
};
export const normalizePaymentResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizePayment)
        : normalizePayment(data);
    return response;
};
export const normalizePayout = (payout) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const amount = Number(payout.amount || 0);
    const commissionAmount = Number(payout.commissionAmount || 0);
    return {
        ...payout,
        providerId: (_a = payout.providerId) !== null && _a !== void 0 ? _a : (_b = payout.Users) === null || _b === void 0 ? void 0 : _b.id,
        providerName: (_c = payout.providerName) !== null && _c !== void 0 ? _c : (_d = payout.Users) === null || _d === void 0 ? void 0 : _d.fullName,
        providerEmail: (_e = payout.providerEmail) !== null && _e !== void 0 ? _e : (_f = payout.Users) === null || _f === void 0 ? void 0 : _f.email,
        bookingFullName: (_g = payout.bookingFullName) !== null && _g !== void 0 ? _g : (_h = payout.Bookings) === null || _h === void 0 ? void 0 : _h.fullName,
        tourTitle: (_j = payout.tourTitle) !== null && _j !== void 0 ? _j : (_l = (_k = payout.Bookings) === null || _k === void 0 ? void 0 : _k.Tours) === null || _l === void 0 ? void 0 : _l.title,
        commissionRate: (_m = payout.commissionRate) !== null && _m !== void 0 ? _m : (amount > 0 ? Math.round((commissionAmount / amount) * 100) : 0),
    };
};
export const normalizePayoutResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizePayout)
        : normalizePayout(data);
    return response;
};
export const normalizeNotification = (notification) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return ({
        ...notification,
        id: (_a = notification.id) !== null && _a !== void 0 ? _a : notification.notificationId,
        userId: (_b = notification.userId) !== null && _b !== void 0 ? _b : notification.user_id,
        bookingId: (_c = notification.bookingId) !== null && _c !== void 0 ? _c : notification.booking_id,
        tourId: (_d = notification.tourId) !== null && _d !== void 0 ? _d : notification.tour_id,
        paymentId: (_e = notification.paymentId) !== null && _e !== void 0 ? _e : notification.payment_id,
        status: (_f = notification.status) !== null && _f !== void 0 ? _f : notification.notificationStatus,
        isRead: Boolean((_g = notification.isRead) !== null && _g !== void 0 ? _g : notification.is_read),
        createdAt: (_h = notification.createdAt) !== null && _h !== void 0 ? _h : notification.created_at,
    });
};
export const normalizeNotificationResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeNotification)
        : normalizeNotification(data);
    return response;
};
export const getUnreadCountValue = (data) => { var _a, _b, _c, _d; return Number((_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.count) !== null && _a !== void 0 ? _a : data === null || data === void 0 ? void 0 : data.unreadCount) !== null && _b !== void 0 ? _b : data === null || data === void 0 ? void 0 : data.unread_count) !== null && _c !== void 0 ? _c : data) !== null && _d !== void 0 ? _d : 0) || 0; };
const normalizeFriendRequest = (request) => {
    var _a, _b, _c;
    return ({
        ...request,
        id: (_a = request.id) !== null && _a !== void 0 ? _a : request.requestId,
        senderName: (_b = request.senderName) !== null && _b !== void 0 ? _b : request.fullName,
        senderEmail: (_c = request.senderEmail) !== null && _c !== void 0 ? _c : request.email,
    });
};
export const normalizeFriendRequestResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeFriendRequest)
        : normalizeFriendRequest(data);
    return response;
};
const normalizeFriend = (friend) => {
    var _a, _b, _c;
    return ({
        ...friend,
        id: (_a = friend.id) !== null && _a !== void 0 ? _a : friend.friendRequestId,
        friendName: (_b = friend.friendName) !== null && _b !== void 0 ? _b : friend.fullName,
        friendEmail: (_c = friend.friendEmail) !== null && _c !== void 0 ? _c : friend.email,
    });
};
export const normalizeFriendResponse = (response) => {
    const data = response.data.data;
    response.data.data = Array.isArray(data)
        ? data.map(normalizeFriend)
        : normalizeFriend(data);
    return response;
};
export const mapGuidePayload = (data) => ({
    ...data,
    fullName: data.fullName || data.name,
});
export const mapTourPayload = (data) => {
    var _a;
    return ({
        ...data,
        category_id: (_a = data.category_id) !== null && _a !== void 0 ? _a : data.categoryId,
    });
};
export const mapActivityPayload = (data) => {
    var _a, _b;
    return ({
        ...data,
        tour_id: (_a = data.tour_id) !== null && _a !== void 0 ? _a : data.tourId,
        activity_time: (_b = data.activity_time) !== null && _b !== void 0 ? _b : data.activityTime,
    });
};
