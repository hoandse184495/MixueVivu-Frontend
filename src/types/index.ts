export type UserRole = 'user' | 'provider' | 'manager';

export type User = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
};

export type Tour = {
  id: number;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  description: string;
  category: string;
  availableSlots: number;
  startDate: string;
  endDate: string;
  guideId: number;
  averageRating: number;
  reviewCount?: number;
  status?: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  providerId?: number;
  providerName?: string;
  providerEmail?: string;
  guideName?: string;
  guidePhone?: string;
  guideEmail?: string;
  guideExperience?: string;
  guideLanguage?: string;
  guideRating?: number;
};

export type Booking = {
  id: number;
  tourId: number;
  userId: number;
  numPeople: number;
  totalPrice: number;
  commissionAmount: number;
  providerAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
  tourTitle?: string;
  tourImage?: string;
  tourLocation?: string;
  tourDuration?: string;
  tourStartDate?: string;
  tourEndDate?: string;
  userName?: string;
  userEmail?: string;
};

export type Review = {
  id: number;
  tourId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string;
  userAvatar?: string;
};

export type Guide = {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  experience?: string;
  language?: string;
  rating?: number;
  avatar?: string;
};

export type Activity = {
  id: number;
  tourId: number;
  title: string;
  description: string;
  day: number;
  time?: string;
  location?: string;
};

export type Contact = {
  id: number;
  userId: number;
  subject: string;
  message: string;
  reply?: string;
  status: 'pending' | 'replied';
  createdAt: string;
  userName?: string;
  userEmail?: string;
};

export type FriendRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  senderName?: string;
  senderEmail?: string;
  receiverName?: string;
  receiverEmail?: string;
};

export type Favorite = {
  id: number;
  tourId: number;
  userId: number;
  tour?: Tour;
};