export type UserRole = 'artist' | 'explorer';

export type VerificationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Needs Review'
  | 'Verified'
  | 'Verification Failed'
  | 'Requires Resubmission';

export type TraditionType = 'Traditional' | 'Contemporary' | 'Both';

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Declined'
  | 'Completed'
  | 'Cancelled';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  artistName: string;
  artForm: string;
  location: string;
  bio: string;
  yearsExperience: number;
  phone?: string;
  languages: string[];
  portfolioUrl?: string;
  traditionType: TraditionType;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  documentUrl?: string;
  createdAt: string;
}

export interface ExplorerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  createdAt: string;
}

export interface Culture {
  id: string;
  slug: string;
  name: string;
  canonicalName: string;
  category: 'Classical Dance' | 'Classical Music' | 'Folk & Ritual Theatre' | 'Traditional Art & Craft' | 'Martial Art' | 'Folk Music';
  region: string;
  overview: string;
  history: string;
  significance: string;
  performanceStyle: string;
  costumes: string;
  instruments: string;
  traditions: string;
  bannerUrl: string;
  imagePlate: string;
  accentColor: string;
  createdAt: string;
}

export interface Artwork {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  cultureId: string;
  cultureName: string;
  title: string;
  description: string;
  mediaUrl: string;
  tags: string[];
  location: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Video {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  cultureId: string;
  cultureName: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  artistId: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  badgeType: 'National Award' | 'Akademi Fellowship' | 'State Honors' | 'Guru Samman' | 'Exhibition Prize';
  proofUrl?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  cultureId: string;
  cultureName: string;
  title: string;
  content: string;
  mediaUrl?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  explorerId: string;
  explorerName: string;
  explorerEmail: string;
  artistId: string;
  artistName: string;
  artForm: string;
  date: string;
  time: string;
  purpose: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  targetId: string;
  targetType: 'artwork' | 'video' | 'post' | 'artist';
  text: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'artwork' | 'video' | 'post' | 'artist';
  createdAt: string;
}

export interface SaveItem {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'artwork' | 'video' | 'post' | 'culture' | 'artist';
  title: string;
  subtitle: string;
  imageUrl: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'like' | 'comment' | 'verification';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface GeminiVerificationResult {
  status: VerificationStatus;
  confidence: number;
  detectedDetails: string;
  reason: string;
  missingRequirements?: string[];
}

export interface CulturePlate {
  id: string;
  cultureId: string;
  cultureSlug: string;
  plateNumber: string;
  title: string;
  subTitle: string;
  scriptText: string;
  region: string;
  era: string;
  image: string;
  journalNote: string;
  mudraOrElement: string;
  accentHex: string;
  order: number;
  createdAt: string;
}

export interface CulturalEvent {
  id: string;
  title: string;
  cultureId?: string;
  cultureName?: string;
  artistId?: string;
  artistName?: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  category?: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  cultureId?: string;
  cultureName?: string;
  artistId?: string;
  artistName?: string;
  eventId?: string;
  size?: string;
  mimeType?: string;
  createdAt: string;
}

export interface AdminUser {
  user_id: string;
  created_at: string;
}

