export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tutor' | 'tutee';
  avatar?: string;
  blurb?: string;
  gender?: string;
  contact?: string;
}

export interface Subject {
  id: string;
  name: string;
  level: string;
  price: number;
}

export interface Availability {
  day: string;
  slots: string[];
}

export interface TutorProfile extends User {
  subjects: Subject[];
  availability: Availability[];
  location: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface TuteeProfile extends User {
  subjectsNeeded: string[];
  level: string;
  availability: Availability[];
  location: string;
}

export interface Match {
  id: string;
  tutor: TutorProfile;
  tutee: TuteeProfile;
  status: 'pending' | 'accepted' | 'rejected';
  subject: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: Date;
  avatar?: string;
}

export type Page = 'landing' | 'login' | 'register' | 'dashboard';
