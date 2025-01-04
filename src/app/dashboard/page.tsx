'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import QuestList from '@/components/QuestList';
import QuestCreateModal from '@/components/QuestCreateModal';
import { TimeStatsDashboard } from '@/components/TimeStatsDashboard';
import TimeProgress from '@/components/TimeProgress';
import LifeProgress from '@/components/LifeProgress';
import { getQuests, createQuest } from '@/lib/firebase';
import type { Quest } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useStore();
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadQuests = async () => {
      try {
        const questsData = await getQuests(user.uid);
        setQuests(questsData);
      } catch (error) {
        console.error('퀘스트 로딩 오류:', error);
        setError('퀘스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuests();
  }, [user, router]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">로그인이 필요합니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <TimeProgress 
            birthDate={user.birthDate} 
            lifeExpectancy={user.lifeExpectancy} 
            userId={user.uid}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <LifeProgress user={user} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">시간 통계</h2>
        <TimeStatsDashboard blocks={user.blocks || {}} />
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          새 퀘스트 생성
        </button>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <QuestList quests={quests} />
      )}

      {isCreateModalOpen && (
        <QuestCreateModal
          userId={user.uid}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={async (questData) => {
            try {
              await createQuest({
                ...questData,
                userId: user.uid,
              });
              setIsCreateModalOpen(false);
              const updatedQuests = await getQuests(user.uid);
              setQuests(updatedQuests);
            } catch (error) {
              console.error('퀘스트 생성 오류:', error);
              setError('퀘스트 생성에 실패했습니다.');
            }
          }}
        />
      )}
    </div>
  );
} 