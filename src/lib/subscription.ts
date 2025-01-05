'use client';

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Firebase } from '@/lib/firebase';
import type { User } from '@/types';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import type { Notification } from '@/types';

export async function subscribeToGoal(
  goalId: string,
  userId: string,
  userData: User,
): Promise<void> {
  try {
    const goalRef = doc(Firebase.db, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);

    if (!goalSnap.exists()) {
      throw new Error('목표를 찾을 수 없습니다.');
    }

    const goalData = goalSnap.data();

    // 목표 작성자에게 알림 전송
    await Firebase.createNotification(
      goalData.userId,
      '새로운 구독자',
      `${userData.name || '알 수 없는 사용자'}님이 회원님의 목표를 구독하기 시작했습니다.`,
      'system',
      {
        goalId,
        senderName: userData.name || '알 수 없는 사용자',
        senderPhotoURL: userData.photoURL || '',
      }
    );

    // 목표의 구독자 목록에 추가
    await updateDoc(goalRef, {
      subscribers: arrayUnion(userId),
    });
  } catch (error) {
    console.error('목표 구독 중 오류 발생:', error);
    throw error;
  }
}

export async function unsubscribeFromGoal(
  goalId: string,
  userId: string,
): Promise<void> {
  try {
    const goalRef = doc(Firebase.db, 'goals', goalId);
    await updateDoc(goalRef, {
      subscribers: arrayRemove(userId),
    });
  } catch (error) {
    console.error('목표 구독 취소 중 오류 발생:', error);
    throw error;
  }
}

export async function checkSubscriptionStatus(
  goalId: string,
  userId: string,
): Promise<boolean> {
  try {
    const goalRef = doc(Firebase.db, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);

    if (!goalSnap.exists()) {
      return false;
    }

    const goalData = goalSnap.data();
    return goalData.subscribers?.includes(userId) || false;
  } catch (error) {
    console.error('구독 상태 확인 중 오류 발생:', error);
    return false;
  }
}

export interface SubscriptionCallback {
  onNotification?: (notification: Notification) => void;
  onError?: (error: Error) => void;
}

export function subscribeToNotifications(
  userId: string,
  callbacks: SubscriptionCallback
) {
  const notificationsRef = collection(Firebase.db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = {
            id: change.doc.id,
            ...change.doc.data()
          } as Notification;
          
          callbacks.onNotification?.(notification);
          
          // 푸시 알림 표시 (브라우저 알림 API 사용)
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon-192x192.png'
            });
          }
        }
      });
    },
    (error) => {
      console.error('알림 구독 중 오류:', error);
      callbacks.onError?.(error);
    }
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
} 