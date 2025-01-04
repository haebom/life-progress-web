'use client';

import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Notification } from '@/types';

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('알림 생성 중 오류 발생:', error);
  }
}

export async function markAllAsRead(userId: string) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('알림 읽음 처리 중 오류 발생:', error);
  }
}

export function createNotificationContent(
  type: Notification['type'],
  metadata?: Notification['metadata']
): { title: string; message: string } {
  switch (type) {
    case 'friend_request':
      return {
        title: '새로운 친구 요청',
        message: '새로운 친구 요청이 도착했습니다.',
      };
    case 'goal_achievement':
      return {
        title: '목표 달성 🎉',
        message: `"${metadata?.goalTitle}" 목표를 달성했습니다!`,
      };
    case 'cheer':
      return {
        title: '응원 메시지',
        message: `친구가 회원님의 목표를 응원합니다: "${metadata?.goalTitle}"`,
      };
    case 'system':
      return {
        title: '시스템 알림',
        message: '시스템 공지사항이 있습니다.',
      };
    default:
      return {
        title: '알림',
        message: '',
      };
  }
} 