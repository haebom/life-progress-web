'use client';

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createNotification } from '@/lib/firebase';
import type { User } from '@/types';

export async function subscribeToGoal(
  goalId: string,
  userId: string,
  userData: User,
): Promise<void> {
  try {
    const goalRef = doc(db, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);

    if (!goalSnap.exists()) {
      throw new Error('목표를 찾을 수 없습니다.');
    }

    const goalData = goalSnap.data();

    // 목표 작성자에게 알림 전송
    await createNotification(
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
    const goalRef = doc(db, 'goals', goalId);
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
    const goalRef = doc(db, 'goals', goalId);
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