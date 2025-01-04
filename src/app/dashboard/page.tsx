'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getUserQuests } from '@/lib/gameSystem';
import TimeProgress from '@/components/TimeProgress';
import { YearProgress } from '@/components/YearProgress';
import type { Quest } from '@/types';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchQuests = async () => {
      try {
        if (!user.uid) {
          setError('사용자 정보를 찾을 수 없습니다.');
          return;
        }

        const userQuests = await getUserQuests(user.uid);
        setQuests(userQuests);
      } catch (err) {
        console.error('퀘스트 로딩 중 오류:', err);
        setError('퀘스트를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchQuests();
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm">
          <TimeProgress 
            birthDate={user?.birthDate} 
            lifeExpectancy={user?.lifeExpectancy} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <YearProgress 
            level={user?.gameStats?.level || 1}
            experience={user?.gameStats?.experience || 0}
            nextLevelExp={user?.gameStats?.nextLevelExp || 100}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">현재 진행 중인 퀘스트</h2>
        {quests.length > 0 ? (
          <ul className="space-y-4">
            {quests.map((quest) => (
              <li key={quest.id} className="border-b pb-4">
                <h3 className="font-medium">{quest.title}</h3>
                <p className="text-gray-600">{quest.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">진행 중인 퀘스트가 없습니다.</p>
        )}
      </div>
    </div>
  );
} 