'use client';

import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Quest, User, Notification } from '@/types';

type NotificationType = Notification['type'];
type NotificationData = NonNullable<Notification['data']>;

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  data?: NotificationData
) {
  try {
    const notificationRef = collection(db, 'notifications');
    await addDoc(notificationRef, {
      userId,
      title,
      message,
      type,
      data,
      createdAt: Timestamp.now(),
      read: false,
    });
  } catch (error) {
    console.error('알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error('알림 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export async function sendQuestProgressNotification(
  quest: Quest,
  user: User
) {
  try {
    const progress = quest.progress || 0;
    let message = '';

    if (progress === 100) {
      message = `${user.displayName || '사용자'}님이 퀘스트 "${quest.title}"를 완료했습니다!`;
    } else if (progress >= 75) {
      message = `${user.displayName || '사용자'}님의 퀘스트 "${quest.title}"가 ${progress}% 진행되었습니다!`;
    } else if (progress >= 50) {
      message = `${user.displayName || '사용자'}님의 퀘스트 "${quest.title}"가 절반을 넘었습니다!`;
    } else if (progress >= 25) {
      message = `${user.displayName || '사용자'}님의 퀘스트 "${quest.title}"가 순조롭게 진행 중입니다.`;
    }

    if (message) {
      await createNotification(
        user.uid,
        '퀘스트 진행 상황',
        message,
        'quest_progress',
        {
          questId: quest.id,
          progress,
        }
      );
    }
  } catch (error) {
    console.error('퀘스트 진행 알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function sendQuestDeadlineNotification(
  quest: Quest,
  user: User
) {
  try {
    if (!quest.dueDate) return;

    const now = new Date();
    const dueDate = quest.dueDate.toDate();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays > 0) {
      await createNotification(
        user.uid,
        '퀘스트 마감일 임박',
        `퀘스트 "${quest.title}"의 마감일이 ${diffDays}일 남았습니다.`,
        'quest_deadline',
        {
          questId: quest.id,
          dueDate: quest.dueDate.toDate().toISOString(),
        }
      );
    }
  } catch (error) {
    console.error('퀘스트 마감일 알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function sendFriendRequestNotification(
  fromUser: User,
  toUserId: string
) {
  try {
    await createNotification(
      toUserId,
      '새로운 친구 요청',
      `${fromUser.displayName || '알 수 없는 사용자'}님이 친구 요청을 보냈습니다.`,
      'friend_request',
      {
        friendId: fromUser.uid,
        senderName: fromUser.displayName || undefined,
        senderPhotoURL: fromUser.photoURL || undefined,
      }
    );
  } catch (error) {
    console.error('친구 요청 알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function sendFriendAcceptNotification(
  fromUser: User,
  toUserId: string
) {
  try {
    await createNotification(
      toUserId,
      '친구 요청 수락',
      `${fromUser.displayName || '알 수 없는 사용자'}님이 친구 요청을 수락했습니다.`,
      'friend_accept',
      {
        friendId: fromUser.uid,
        senderName: fromUser.displayName || undefined,
        senderPhotoURL: fromUser.photoURL || undefined,
      }
    );
  } catch (error) {
    console.error('친구 수락 알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function createQuestLikeNotification(
  questId: string,
  questTitle: string,
  ownerId: string,
  likerId: string,
  likerName: string
) {
  if (ownerId === likerId) return;

  await createNotification(
    ownerId,
    '새로운 좋아요',
    `${likerName}님이 퀘스트 "${questTitle}"를 좋아합니다.`,
    'quest_like',
    {
      questId,
      questTitle,
    }
  );
}

export async function createQuestCommentNotification(
  questId: string,
  questTitle: string,
  ownerId: string,
  commenterId: string,
  commenterName: string
) {
  if (ownerId === commenterId) return;

  await createNotification(
    ownerId,
    '새로운 댓글',
    `${commenterName}님이 퀘스트 "${questTitle}"에 댓글을 남겼습니다.`,
    'quest_comment',
    {
      questId,
      questTitle,
    }
  );
}

export async function createQuestUpdateNotification(
  quest: Quest,
  oldProgress: number
) {
  if (!quest.isShared || oldProgress === quest.progress) return;

  const progressDiff = (quest.progress || 0) - oldProgress;
  const message = quest.status === 'completed'
    ? `퀘스트 "${quest.title}"가 완료되었습니다!`
    : `퀘스트 "${quest.title}"의 진행률이 ${progressDiff > 0 ? '+' : ''}${progressDiff.toString()}% 변경되었습니다.`;

  await createNotification(
    quest.userId,
    '퀘스트 업데이트',
    message,
    'quest_update',
    {
      questId: quest.id,
      questTitle: quest.title,
      progress: quest.progress || 0,
    }
  );
}

export async function checkDeadlineNotification(quest: Quest) {
  if (!quest.dueDate || quest.status === 'completed') return;

  const now = new Date();
  const dueDate = quest.dueDate.toDate();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 7 && daysUntilDue > 0) {
    await createNotification(
      quest.userId,
      '마감일 임박',
      `퀘스트 "${quest.title}"의 마감일이 ${daysUntilDue}일 남았습니다.`,
      'quest_deadline',
      {
        questId: quest.id,
        questTitle: quest.title,
      }
    );
  }
} 