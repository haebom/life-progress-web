'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useStore from '@/store/useStore';
import type { Activity } from '@/types';
import { Timestamp } from 'firebase/firestore';

export const ActivityFeed = () => {
  const { user } = useStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;

      try {
        const activitiesRef = collection(db, 'activities');
        const q = query(
          activitiesRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const activityData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt : Timestamp.fromDate(new Date(doc.data().createdAt)),
        })) as Activity[];

        setActivities(activityData);
      } catch (error) {
        console.error('활동 기록 로딩 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500">
        아직 활동 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex items-start gap-3">
            {activity.userPhotoURL && (
              <div className="relative w-8 h-8">
                <Image
                  src={activity.userPhotoURL}
                  alt={activity.userName}
                  fill
                  className="rounded-full object-cover"
                  sizes="32px"
                />
              </div>
            )}
            <div>
              <p className="text-sm">
                <span className="font-medium">{activity.userName}</span>
                {' '}
                {activity.content}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.createdAt.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 