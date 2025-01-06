import { Timestamp } from 'firebase/firestore/lite';
import type { User as FirebaseUser } from 'firebase/auth';

export type QuestStatus = 'active' | 'completed' | 'failed' | 'deleted';

export interface Block {
  id: string;
  title: string;
  description?: string;
  status: QuestStatus;
  progress: number;
  dueDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BlockMap {
  [key: string]: Block;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: QuestStatus;
  progress: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  dueDate?: Timestamp;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  isShared?: boolean;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rewards: {
    exp: number;
    points: number;
  };
  likes: number;
  likedBy?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'quest_update' | 'achievement' | 'follow' | 'like' | 'system';
  read: boolean;
  createdAt: Timestamp;
  data?: {
    questId?: string;
    questTitle?: string;
    achievementId?: string;
    achievementTitle?: string;
    userId?: string;
    userName?: string;
    [key: string]: any;
  };
}

export interface UserStats {
  level: number;
  experience: number;
  questsCompleted: number;
  points: number;
  streak: number;
  lastActive: Timestamp;
  achievements: string[];
  nextLevelExp: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  displayName: string;
  photoURL: string;
  birthDate: Timestamp;
  lifeExpectancy: number;
  isPublic: boolean;
  pushNotifications: boolean;
  gameStats: UserStats;
  blocks: BlockMap;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  lastActive: Timestamp;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: 'ko' | 'en';
  };
  followers: string[];
  following: string[];
  isFollowing?: boolean;
  fcmToken?: string;
}

export interface BaseUser extends FirebaseUser {
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: {
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }[];
}

export type User = BaseUser & UserProfile;

export type AuthResultType = 'success' | 'error' | 'redirect' | 'in_app_browser' | 'no_result';

export type AuthResult = 
  | { type: 'success'; user: User; message?: string }
  | { type: 'error'; message: string; user?: User }
  | { type: 'redirect'; message?: string; user?: User }
  | { type: 'no_result'; message?: string; user?: User }
  | { type: 'in_app_browser'; message?: string; user?: User };

export interface UserState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export interface BrowserState {
  isInAppBrowser: boolean;
  isSafari: boolean;
}

export interface AuthState extends UserState, BrowserState {}

export interface LoginError extends Error {
  code?: string;
  message: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'quest_created' | 'quest_completed' | 'quest_failed' | 'level_up' | 'achievement_unlocked';
  title: string;
  description: string;
  content: string;
  userName: string;
  userPhotoURL: string;
  metadata: Record<string, any>;
  createdAt: Timestamp;
} 