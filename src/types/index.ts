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