'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import QuestList from '@/components/QuestList';
import QuestCreateModal from '@/components/QuestCreateModal';
import { TimeStatsDashboard } from '@/components/TimeStatsDashboard';
import TimeProgress from '@/components/TimeProgress';
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
      if (!user.uid) {
        console.error('유저 ID가 없습니다.');
        setError('사용자 정보를 불러올 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const questsData = await getQuests(user.uid);
        setQuests(questsData || []);
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
      <div className="w-full max-w-md mx-auto px-4 py-6 min-h-screen">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const activeQuests = quests.filter(quest => quest.status !== 'completed').slice(0, 3);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:max-w-xl md:max-w-4xl min-h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">내의 모험</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
          >
            새 퀘스트 시작
          </button>
        </div>
        <TimeProgress 
          birthDate={user.birthDate} 
          lifeExpectancy={user.lifeExpectancy} 
          userId={user.uid}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">진행 중인 퀘스트</h2>
          <button
            onClick={() => router.push('/quests')}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            퀘스트 로그 보기
          </button>
        </div>
        {error ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        ) : activeQuests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">새로운 모험이 기다리고 있어요!</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              첫 퀘스트 시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <QuestList quests={activeQuests} />
            {quests.length > 3 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => router.push('/quests')}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  {quests.length - 3}개의 퀘스트 더 보기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <TimeStatsDashboard blocks={user.blocks || {}} />
      </div>

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