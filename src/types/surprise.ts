export type PhotoCategory = 'Favorit' | 'Perjalanan' | 'Keluarga & Teman';

export type WishTheme = 'ivory' | 'rose' | 'ink';

export interface MemoryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  dateLabel: string;
  category: PhotoCategory;
  featured: boolean;
  createdAt: string;
}

export interface BirthdayWish {
  id: string;
  senderName: string;
  relation: string;
  message: string;
  theme: WishTheme;
  pinned: boolean;
  createdAt: string;
}

export interface SurpriseProfile {
  recipientName: string;
  age: number;
  dateDisplay: string;
  heroTitle: string;
  heroIntro: string;
  heroPhotoUrl: string;
  senderName: string;
  mainLetterTitle: string;
  mainLetterBody: string;
  secretGiftTitle: string;
  secretGiftBody: string;
  musicPreset?: 'musicbox' | 'piano' | 'custom';
  musicTitle?: string;
  musicUrl?: string;
}

export interface SurpriseData {
  profile: SurpriseProfile;
  photos: MemoryPhoto[];
  wishes: BirthdayWish[];
}
