import { Timestamp } from 'firebase/firestore';

export type QuestStatus = 'active' | 'completed' | 'failed';

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
}

export interface QuestComment {
  id: string;
  questId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QuestCheer {
  id: string;
  questId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  message: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'goals_completed' | 'total_goals' | 'consecutive_days' | 'points_earned' | 'level_reached';
    value: number;
  };
  reward: {
    points: number;
    experience: number;
  };
  unlockedAt?: Timestamp;
}

export interface GameStats {
  level: number;
  experience: number;
  questsCompleted: number;
  points: number;
  streak: number;
  lastActive: Timestamp | null;
  achievements: Achievement[];
  nextLevelExp: number;
}

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

export interface User {
  id: string;
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  birthDate: Timestamp;
  lifeExpectancy: number;
  bio?: string;
  isPublic: boolean;
  pushNotifications: boolean;
  friends?: string[];
  followers?: string[];
  following?: string[];
  isFollowing?: boolean;
  gameStats: GameStats;
  blocks: BlockMap;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  quests: number;
  level: number;
  points: number;
  streak: number;
  lastActive: Timestamp;
  achievements: string[];
  settings: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  senderId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  title: string;
  message: string;
  type: 'quest_deadline' | 'quest_comment' | 'quest_like' | 'quest_update' | 'friend_request' | 'goal_achievement' | 'cheer' | 'system';
  data: Record<string, string>;
  read: boolean;
  createdAt: Timestamp;
  metadata?: {
    goalId?: string;
    goalTitle?: string;
    progress?: number;
    [key: string]: string | number | undefined;
  };
  action?: {
    type: 'accept_friend' | 'view_goal' | 'view_quest' | 'send_cheer';
    data?: {
      friendId?: string;
      goalId?: string;
      questId?: string;
      message?: string;
    };
  };
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content?: string;
  type: 'quest_created' | 'quest_completed' | 'quest_failed' | 'achievement_unlocked' | 'level_up' | 'friend_added' | 'goal_created' | 'goal_progress' | 'goal_completed' | 'friend_joined';
  data: {
    questId?: string;
    questTitle?: string;
    achievementId?: string;
    achievementTitle?: string;
    level?: number;
    friendId?: string;
    friendName?: string;
    goalId?: string;
    goalTitle?: string;
    progress?: number;
    [key: string]: string | number | undefined;
  };
  metadata?: {
    goalId?: string;
    goalTitle?: string;
    progress?: number;
    [key: string]: string | number | undefined;
  };
  createdAt: Timestamp;
}

// 타입 가드
export const isTimestamp = (value: unknown): value is Timestamp => {
  return value instanceof Timestamp;
};

export const isQuest = (value: unknown): value is Quest => {
  if (!value || typeof value !== 'object' || value === null) {
    return false;
  }
  
  const v = value as Record<string, unknown>;
  return (
    'id' in v &&
    'userId' in v &&
    'title' in v &&
    'description' in v &&
    'status' in v &&
    'progress' in v
  );
}; 