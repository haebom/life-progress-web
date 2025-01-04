'use client';

import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Activity } from '@/types';

export async function recordActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
  try {
    await addDoc(collection(db, 'activities'), {
      ...activity,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('활동 기록 중 오류 발생:', error);
  }
}

export function createActivityContent(
  type: Activity['type'],
  metadata?: Activity['metadata']
): string {
  switch (type) {
    case 'goal_created':
      return `새로운 목표를 설정했습니다: ${metadata?.goalTitle}`;
    case 'goal_progress':
      return `목표 진행률이 ${metadata?.progress}%가 되었습니다: ${metadata?.goalTitle}`;
    case 'goal_completed':
      return `목표를 달성했습니다: ${metadata?.goalTitle}`;
    case 'friend_joined':
      return '라이프 프로그레스에 가입했습니다!';
    default:
      return '';
  }
} 