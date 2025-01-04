'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface NotificationCenterProps {
  userId: string;
  onAction?: (notification: Notification) => void;
}

export function NotificationCenter({ userId, onAction }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // 실시간으로 알림 구독
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt : Timestamp.fromDate(new Date(doc.data().createdAt)),
      })) as Notification[];
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      // 읽음 상태 업데이트
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true,
      });
    }

    if (notification.action && onAction) {
      onAction(notification);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request': return '👥';
      case 'goal_achievement': return '🎉';
      case 'cheer': return '📣';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  return (
    <div className="relative">
      {/* 알림 벨 아이콘 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 알림 패널 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
          <div className="p-4 border-b">
            <h3 className="font-bold">알림</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">로딩 중...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                새로운 알림이 없습니다
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {notification.senderPhotoURL ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={notification.senderPhotoURL}
                          alt={notification.senderName || ''}
                          fill
                          className="rounded-full object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{notification.title}</div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 