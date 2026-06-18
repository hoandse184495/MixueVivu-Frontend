import { Tour, Booking, Guide, Contact, Favorite, FriendRequest } from '../types';

// Helper to simulate API response format with delay
const mockApiResponse = <T>(data: T, delay = 200): Promise<{ data: { data: T; success: boolean; message: string } }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data,
          success: true,
          message: 'Thành công',
        },
      });
    }, delay);
  });
};

// ─── In-Memory Database ──────────────────────────────────────────────────────

let mockTours: Tour[] = [
  {
    id: 1,
    title: 'Ha Long Bay Cruise',
    location: 'Hạ Long, Quảng Ninh',
    price: 450000,
    duration: '2 ngày 1 đêm',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    description: 'Khám phá Vịnh Hạ Long kì vĩ với du thuyền 5 sao đẳng cấp. Lịch trình bao gồm chèo thuyền kayak, tham quan hang Sửng Sốt, và thưởng thức ẩm thực hải sản tươi ngon.',
    category: 'Biển',
    availableSlots: 10,
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    guideId: 1,
    averageRating: 4.8,
    reviewCount: 42,
    status: 'approved',
    providerId: 2,
    providerName: 'AdventureCo',
    providerEmail: 'adventure@gmail.com',
  },
  {
    id: 2,
    title: 'Sapa Trekking Adventure',
    location: 'Sa Pa, Lào Cai',
    price: 320000,
    duration: '3 ngày 2 đêm',
    image: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=800',
    description: 'Hành trình trekking leo núi đi qua các ruộng bậc thang chín vàng tuyệt đẹp và các bản làng mộc mạc của người Hmong, người Dao tại Sa Pa. Trải nghiệm ngủ bản (homestay).',
    category: 'Núi',
    availableSlots: 15,
    startDate: '2026-07-05',
    endDate: '2026-07-08',
    guideId: 2,
    averageRating: 4.7,
    reviewCount: 28,
    status: 'approved',
    providerId: 2,
    providerName: 'AdventureCo',
    providerEmail: 'adventure@gmail.com',
  },
  {
    id: 3,
    title: 'Phu Quoc Island Escape',
    location: 'Phú Quốc, Kiên Giang',
    price: 590000,
    duration: '4 ngày 3 đêm',
    image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=800',
    description: 'Tận hưởng không gian nghỉ dưỡng tuyệt vời tại bãi biển Phú Quốc cát trắng xanh mát. Trải nghiệm lặn ngắm san hô tại hòn Móng Tay và tham quan vườn tiêu nghệ thuật.',
    category: 'Biển',
    availableSlots: 8,
    startDate: '2026-07-10',
    endDate: '2026-07-14',
    guideId: 3,
    averageRating: 4.9,
    reviewCount: 56,
    status: 'approved',
    providerId: 2,
    providerName: 'AdventureCo',
    providerEmail: 'adventure@gmail.com',
  },
  {
    id: 4,
    title: 'Mekong Delta Boat Trip',
    location: 'Cần Thơ',
    price: 180000,
    duration: '1 ngày',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    description: 'Hành trình sông nước khám phá chợ nổi Cái Răng tấp nập, chèo thuyền qua các con rạch rợp bóng dừa nước và thưởng thức trái cây nhiệt đới tại nhà vườn địa phương.',
    category: 'Khám phá',
    availableSlots: 20,
    startDate: '2026-07-02',
    endDate: '2026-07-02',
    guideId: 1,
    averageRating: 4.5,
    reviewCount: 19,
    status: 'pending',
    providerId: 2,
    providerName: 'AdventureCo',
    providerEmail: 'adventure@gmail.com',
  },
  {
    id: 5,
    title: 'Đà Nẵng City Tour',
    location: 'Đà Nẵng',
    price: 150000,
    duration: '1 ngày',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    description: 'Khám phá Ngũ Hành Sơn kỳ bí, tham quan Cầu Vàng Bà Nà Hills độc đáo và chiêm ngưỡng các cây cầu lung linh về đêm của thành phố Đà Nẵng năng động.',
    category: 'Thành phố',
    availableSlots: 12,
    startDate: '2026-07-04',
    endDate: '2026-07-04',
    guideId: 2,
    averageRating: 4.6,
    reviewCount: 34,
    status: 'approved',
    providerId: 2,
    providerName: 'AdventureCo',
    providerEmail: 'adventure@gmail.com',
  },
];

let mockBookings: Booking[] = [
  {
    id: 101,
    tourId: 1,
    userId: 3,
    numPeople: 2,
    totalPrice: 900000,
    commissionAmount: 90000,
    providerAmount: 810000,
    status: 'confirmed',
    createdAt: '2026-06-10T12:00:00Z',
    tourTitle: 'Ha Long Bay Cruise',
    tourImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    tourLocation: 'Hạ Long, Quảng Ninh',
    tourDuration: '2 ngày 1 đêm',
    userName: 'Nguyen Hoa',
    userEmail: 'hoa@gmail.com',
  },
  {
    id: 102,
    tourId: 2,
    userId: 3,
    numPeople: 1,
    totalPrice: 320000,
    commissionAmount: 32000,
    providerAmount: 288000,
    status: 'pending',
    createdAt: '2026-06-15T08:30:00Z',
    tourTitle: 'Sapa Trekking Adventure',
    tourImage: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=800',
    tourLocation: 'Sa Pa, Lào Cai',
    tourDuration: '3 ngày 2 đêm',
    userName: 'Bella Thorne',
    userEmail: 'bella@gmail.com',
  },
  {
    id: 103,
    tourId: 3,
    userId: 3,
    numPeople: 3,
    totalPrice: 1770000,
    commissionAmount: 177000,
    providerAmount: 1593000,
    status: 'completed',
    createdAt: '2026-05-20T14:15:00Z',
    tourTitle: 'Phu Quoc Island Escape',
    tourImage: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=800',
    tourLocation: 'Phú Quốc, Kiên Giang',
    tourDuration: '4 ngày 3 đêm',
    userName: 'Alex Morgan',
    userEmail: 'alex@gmail.com',
  },
];

let mockGuides: Guide[] = [
  {
    id: 1,
    name: 'Michael Scott',
    email: 'michael@mixuevivu.com',
    phone: '0912345678',
    experience: '5 năm kinh nghiệm dẫn tour Hà Giang, Tây Bắc',
    rating: 4.9,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk4cO_lkHRyu4iOia8BV1ZkuKYvmCuvzRlGsD14_ZivoaFyFODfEuI2EYvPZo6d44WGKt6Agyv2kRTSoZpQ43pIydbk4maqYSrV9rBMnaPYtaItssXgvlwi6kSjWchGRQgjpQl0KhWmaXAy3j3Iv1LpmAivs6NdqqSHWoXcdVfbxKVLl4kmd7Jrty30bJSbqIXWl_I0RTX2S9d9ND1C28SAJ7BBMh9GNbVxhQU3wFigcUa9mrvPcODI6TXj28L5t-vJxAtYZn_Kgua',
  },
  {
    id: 2,
    name: 'Alex Johnson',
    email: 'alex@mixuevivu.com',
    phone: '0987654321',
    experience: 'Chuyên gia du lịch biển Nha Trang, Phú Quốc',
    rating: 4.8,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvfkzkm69WAniZGu-iUiooSRvDhTBfrg9GJbZVYAiWu1ymnm4RTXyExr2W7MbcCr1jJ-Vgh27wRMuAk-q9fgDI6wagjHmSfqi42RlhvfYbIE3EOBA7VY4_qaD0hEEFgEFLtkArBP7T-6ASMgMVT5lHMLR9TyLnbTajlPYG1dU8mxs5ihuEwwb8BAH0UdIwOodLiKEHZpDBP0GwCD4LRPQkSt_WjoRFZxJ7mgbzMUkoAMPOJZj0zcQuk18-Cz-HcT0wTweIspQ8Y0G1',
  },
  {
    id: 3,
    name: 'Bella Thorne',
    email: 'bella@mixuevivu.com',
    phone: '0905556666',
    experience: 'Chứng chỉ hướng dẫn viên quốc tế, thông thạo Anh - Trung',
    rating: 4.7,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpmRYbnL-YVyQDj9dhIIa1BM4RIgR0Li38v0WfvLytRcmsWZbLjkq1B3rPwM4N2-PIf7pgxpBOOKxg7UMd4U58Ff-2--03Yc2_JxFh-JLOwcy3dVz7NzBNh4kDYbbnba5wgKJ7V612N9LpkZT3pl5p9MqU-T6HLRxDyWg2Fk4PwgYIgMcYehBHT9WnEK0lXyr5WXxtcYPFZK__N2xmnksq9ZlDWvQFZqV_JsZgSQeBXwIajNHASZMzneqYwJvB80MtqqBtvuQAaQc6',
  },
];

let mockContacts: Contact[] = [
  {
    id: 201,
    userId: 3,
    subject: 'Cần hỗ trợ thanh toán',
    message: 'Tôi muốn thanh toán qua QR code nhưng ứng dụng báo lỗi đường truyền. Vui lòng kiểm tra hỗ trợ tôi gấp.',
    reply: 'Dạ chào anh, anh có thể tải lại trang thanh toán hoặc quét lại mã QR mới nhất đã được cập nhật lại ở trang thanh toán rồi ạ.',
    status: 'replied',
    createdAt: '2026-06-17T09:00:00Z',
    userName: 'Alex Morgan',
    userEmail: 'alex@gmail.com',
  },
  {
    id: 202,
    userId: 3,
    subject: 'Hỏi về tour Sa Pa',
    message: 'Tour trekking Sa Pa có bao gồm hướng dẫn viên đi cùng suốt hành trình leo núi không ạ?',
    status: 'pending',
    createdAt: '2026-06-18T05:20:00Z',
    userName: 'Chris Kim',
    userEmail: 'chris@gmail.com',
  },
];

let mockFavorites: Favorite[] = [
  {
    id: 1,
    tourId: 1,
    userId: 3,
  },
  {
    id: 2,
    tourId: 2,
    userId: 3,
  },
];

let mockFriendRequests: FriendRequest[] = [
  {
    id: 301,
    senderId: 4,
    receiverId: 3,
    status: 'pending',
    createdAt: '2026-06-18T10:00:00Z',
    senderName: 'David Beckham',
    senderEmail: 'david@gmail.com',
  },
];

let mockFriends: any[] = [
  { id: 4, fullName: 'David Beckham', email: 'david@gmail.com', phone: '0901112222' },
  { id: 5, fullName: 'Lionel Messi', email: 'messi@gmail.com', phone: '0903334444' },
];

// ─── Service Methods Implementation ──────────────────────────────────────────

export const authService = {
  login: (email: string, password: string) => {
    let role: 'user' | 'provider' | 'manager' = 'user';
    const emailLower = email.toLowerCase();
    if (emailLower.includes('manager') || emailLower.includes('admin')) {
      role = 'manager';
    } else if (emailLower.includes('provider')) {
      role = 'provider';
    }
    return mockApiResponse({
      token: 'mock-session-token',
      user: {
        id: 3,
        fullName: role === 'manager' ? 'Admin Manager' : role === 'provider' ? 'Partner Provider' : 'Nguyen Hoa',
        email,
        phone: '0901234567',
        role,
      },
    });
  },
  register: (data: any) => mockApiResponse(data),
  getProfile: () =>
    mockApiResponse({
      id: 3,
      fullName: 'Nguyen Hoa',
      email: 'hoa@gmail.com',
      phone: '0901234567',
      role: 'user',
    }),
};

export const tourService = {
  getAll: (search?: string) => {
    let list = [...mockTours];
    if (search) {
      list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase()));
    }
    return mockApiResponse(list);
  },
  getById: (id: number) => {
    const tour = mockTours.find((t) => t.id === id) || mockTours[0];
    const reviews = [
      { id: 1, tourId: id, userId: 1, rating: 5, comment: 'Tour quá tuyệt vời, biển trong xanh và HDV rất nhiệt tình!', createdAt: '2026-06-15', userName: 'David Beckham' },
      { id: 2, tourId: id, userId: 2, rating: 4.5, comment: 'Lịch trình di chuyển hơi nhanh một chút nhưng dịch vụ ăn uống và phòng ốc rất tốt.', createdAt: '2026-06-16', userName: 'Lionel Messi' }
    ];
    return mockApiResponse({ ...tour, reviews });
  },
  getPending: () => {
    const list = mockTours.filter((t) => t.status === 'pending');
    return mockApiResponse(list);
  },
  getMyTours: () => {
    // Provider views their tours
    return mockApiResponse(mockTours);
  },
  create: (data: any) => {
    const newTour: Tour = {
      id: Date.now(),
      ...data,
      averageRating: 0,
      reviewCount: 0,
      status: 'pending',
      providerName: 'AdventureCo',
      providerEmail: 'adventure@gmail.com',
    };
    mockTours = [newTour, ...mockTours];
    return mockApiResponse(newTour);
  },
  update: (id: number, data: any) => {
    mockTours = mockTours.map((t) => (t.id === id ? { ...t, ...data } : t));
    return mockApiResponse(mockTours.find((t) => t.id === id));
  },
  delete: (id: number) => {
    mockTours = mockTours.filter((t) => t.id !== id);
    return mockApiResponse({ id });
  },
  approve: (id: number) => {
    mockTours = mockTours.map((t) => (t.id === id ? { ...t, status: 'approved' as const } : t));
    return mockApiResponse({ id, status: 'approved' });
  },
  reject: (id: number, rejectReason: string) => {
    mockTours = mockTours.map((t) => (t.id === id ? { ...t, status: 'rejected' as const, rejectReason } : t));
    return mockApiResponse({ id, status: 'rejected', rejectReason });
  },
  addReview: (tourId: number, rating: number, comment: string) => {
    mockTours = mockTours.map((t) => {
      if (t.id === tourId) {
        const count = (t.reviewCount || 0) + 1;
        const avg = ((t.averageRating || 0) * (t.reviewCount || 0) + rating) / count;
        return { ...t, reviewCount: count, averageRating: parseFloat(avg.toFixed(1)) };
      }
      return t;
    });
    return mockApiResponse({ tourId, rating, comment });
  },
};

export const bookingService = {
  create: (tourId: number, numPeople: number) => {
    const tour = mockTours.find((t) => t.id === tourId);
    const price = tour ? tour.price : 200000;
    const title = tour ? tour.title : 'Tour du lịch';
    const location = tour ? tour.location : 'Địa điểm';
    const duration = tour ? tour.duration : '1 ngày';
    const image = tour ? tour.image : '';

    const newBooking: Booking = {
      id: Date.now(),
      tourId,
      userId: 3,
      numPeople,
      totalPrice: price * numPeople,
      commissionAmount: price * numPeople * 0.1,
      providerAmount: price * numPeople * 0.9,
      status: 'pending',
      createdAt: new Date().toISOString(),
      tourTitle: title,
      tourImage: image,
      tourLocation: location,
      tourDuration: duration,
      userName: 'Nguyen Hoa',
      userEmail: 'hoa@gmail.com',
    };

    mockBookings = [newBooking, ...mockBookings];
    return mockApiResponse(newBooking);
  },
  getMyBookings: () => {
    return mockApiResponse(mockBookings);
  },
  cancel: (id: number) => {
    mockBookings = mockBookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b));
    return mockApiResponse({ id, status: 'cancelled' });
  },
  getProviderBookings: () => {
    return mockApiResponse(mockBookings);
  },
  getAllBookings: () => {
    return mockApiResponse(mockBookings);
  },
  updateStatus: (id: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    mockBookings = mockBookings.map((b) => (b.id === id ? { ...b, status } : b));
    return mockApiResponse({ id, status });
  },
};

export const favoriteService = {
  getAll: () => {
    const favs = mockFavorites.map((f) => {
      const tour = mockTours.find((t) => t.id === f.tourId);
      return { ...f, tour };
    });
    return mockApiResponse(favs);
  },
  add: (tourId: number) => {
    const exists = mockFavorites.some((f) => f.tourId === tourId);
    if (!exists) {
      mockFavorites.push({ id: Date.now(), tourId, userId: 3 });
    }
    return mockApiResponse({ tourId });
  },
  remove: (tourId: number) => {
    mockFavorites = mockFavorites.filter((f) => f.tourId !== tourId);
    return mockApiResponse({ tourId });
  },
  check: (tourId: number) => {
    const isFav = mockFavorites.some((f) => f.tourId === tourId);
    return mockApiResponse({ isFavorited: isFav });
  },
};

export const activityService = {
  getByTour: (tourId: number) => {
    const list = [
      { id: 1, tourId, title: 'Đón khách và khởi hành', description: 'Đón khách tại điểm hẹn và di chuyển đến địa điểm tham quan.', day: 1, time: '08:00', location: 'Điểm khởi hành' },
      { id: 2, tourId, title: 'Tham quan và khám phá', description: 'Bắt đầu hành trình trekking hoặc tham quan các di tích thắng cảnh.', day: 1, time: '13:30', location: 'Địa điểm tham quan' },
    ];
    return mockApiResponse(list);
  },
  getById: (id: number) => mockApiResponse({ id, title: 'Hoạt động mẫu' }),
  create: (data: any) => mockApiResponse(data),
  update: (id: number, data: any) => mockApiResponse(data),
  delete: (id: number) => mockApiResponse({ id }),
};

export const guideService = {
  getAll: () => {
    return mockApiResponse(mockGuides);
  },
  getById: (id: number) => {
    return mockApiResponse(mockGuides.find((g) => g.id === id) || mockGuides[0]);
  },
  create: (data: any) => {
    const newGuide: Guide = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      experience: data.experience,
      rating: 5.0,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk4cO_lkHRyu4iOia8BV1ZkuKYvmCuvzRlGsD14_ZivoaFyFODfEuI2EYvPZo6d44WGKt6Agyv2kRTSoZpQ43pIydbk4maqYSrV9rBMnaPYtaItssXgvlwi6kSjWchGRQgjpQl0KhWmaXAy3j3Iv1LpmAivs6NdqqSHWoXcdVfbxKVLl4kmd7Jrty30bJSbqIXWl_I0RTX2S9d9ND1C28SAJ7BBMh9GNbVxhQU3wFigcUa9mrvPcODI6TXj28L5t-vJxAtYZn_Kgua',
    };
    mockGuides = [...mockGuides, newGuide];
    return mockApiResponse(newGuide);
  },
  update: (id: number, data: any) => {
    mockGuides = mockGuides.map((g) => (g.id === id ? { ...g, ...data } : g));
    return mockApiResponse(mockGuides.find((g) => g.id === id));
  },
  delete: (id: number) => {
    mockGuides = mockGuides.filter((g) => g.id !== id);
    return mockApiResponse({ id });
  },
};

export const contactService = {
  create: (subject: string, message: string) => {
    const newContact: Contact = {
      id: Date.now(),
      userId: 3,
      subject,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userName: 'Nguyen Hoa',
      userEmail: 'hoa@gmail.com',
    };
    mockContacts = [newContact, ...mockContacts];
    return mockApiResponse(newContact);
  },
  getMyContacts: () => {
    return mockApiResponse(mockContacts);
  },
  getAll: () => {
    return mockApiResponse(mockContacts);
  },
  reply: (id: number, reply: string) => {
    mockContacts = mockContacts.map((c) => (c.id === id ? { ...c, reply, status: 'replied' as const } : c));
    return mockApiResponse({ id, reply, status: 'replied' });
  },
};

export const friendService = {
  search: (keyword: string) => {
    const searchRes = [
      { id: 10, fullName: 'David Beckham', email: 'david@gmail.com' },
      { id: 11, fullName: 'Lionel Messi', email: 'messi@gmail.com' },
    ];
    return mockApiResponse(searchRes.filter((u) => u.fullName.toLowerCase().includes(keyword.toLowerCase())));
  },
  getFriends: () => {
    return mockApiResponse(mockFriends);
  },
  getRequests: () => {
    return mockApiResponse(mockFriendRequests);
  },
  sendRequest: (receiverId: number) => {
    return mockApiResponse({ receiverId });
  },
  accept: (id: number) => {
    const req = mockFriendRequests.find((r) => r.id === id);
    if (req) {
      mockFriends = [...mockFriends, { id: req.senderId, fullName: req.senderName || 'Bạn bè', email: req.senderEmail || '' }];
      mockFriendRequests = mockFriendRequests.filter((r) => r.id !== id);
    }
    return mockApiResponse({ id, status: 'accepted' });
  },
  reject: (id: number) => {
    mockFriendRequests = mockFriendRequests.filter((r) => r.id !== id);
    return mockApiResponse({ id, status: 'rejected' });
  },
  remove: (id: number) => {
    mockFriends = mockFriends.filter((f) => f.id !== id);
    return mockApiResponse({ id });
  },
};
