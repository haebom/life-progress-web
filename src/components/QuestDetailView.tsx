'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { getQuest, updateQuest } from '@/lib/firebase';
import type { Quest, QuestStatus } from '@/types';

interface QuestDetailViewProps {
  questId: string;
}

export default function QuestDetailView({ questId }: QuestDetailViewProps) {
  const router = useRouter();
  const { user } = useStore();
  const [quest, setQuest] = React.useState<Quest | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);

  React.useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadQuest = async () => {
      try {
        const questData = await getQuest(questId);
        if (questData) {
          setQuest(questData);
          setProgress(questData.progress || 0);
        } else {
          setError('퀘스트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('퀘스트 로딩 오류:', error);
        setError('퀘스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuest();
  }, [questId, user, router]);

  const handleProgressUpdate = async () => {
    if (!quest) return;

    try {
      const newStatus: QuestStatus = progress >= 100 ? 'completed' : 'active';
      const updatedQuest: Quest = {
        ...quest,
        progress,
        status: newStatus,
      };

      await updateQuest(questId, updatedQuest);
      setQuest(updatedQuest);
    } catch (error) {
      console.error('진행률 업데이트 오류:', error);
      setError('진행률 업데이트에 실패했습니다.');
    }
  };

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
        <p className="text-gray-600">퀘스트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || '퀘스트를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{quest.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${quest.status === 'completed' ? 'bg-green-100 text-green-800' :
              quest.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'}`}
          >
            {quest.status === 'completed' ? '완료' :
             quest.status === 'failed' ? '실패' : '진행중'}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">퀘스트 설명</h2>
            <p className="text-gray-600">{quest.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">진행률</h2>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="flex-grow"
              />
              <span className="text-lg font-medium">{progress}%</span>
            </div>
            <button
              onClick={handleProgressUpdate}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              진행률 업데이트
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">세부 정보</h2>
            <div className="space-y-2 text-gray-600">
              <p>시작일: {quest.startDate.toDate().toLocaleDateString()}</p>
              {quest.endDate && (
                <p>종료일: {quest.endDate.toDate().toLocaleDateString()}</p>
              )}
              <p>중요도: {quest.priority || '설정되지 않음'}</p>
              <p>카테고리: {quest.category || '설정되지 않음'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            대시보드로 돌아가기
          </button>
          {quest.status === 'active' && (
            <button
              onClick={async () => {
                try {
                  const updatedQuest: Quest = {
                    ...quest,
                    status: 'failed',
                  };
                  await updateQuest(questId, updatedQuest);
                  setQuest(updatedQuest);
                } catch (error) {
                  console.error('퀘스트 상태 업데이트 오류:', error);
                  setError('퀘스트 상태 업데이트에 실패했습니다.');
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              퀘스트 포기
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 