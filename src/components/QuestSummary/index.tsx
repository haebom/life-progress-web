'use client';

import type { Quest } from '@/types';

interface QuestSummaryProps {
  quests: Quest[];
}

export default function QuestSummary({ quests }: QuestSummaryProps) {
  const activeQuests = quests.filter(quest => quest.status === 'active');
  const completedQuests = quests.filter(quest => quest.status === 'completed');
  const failedQuests = quests.filter(quest => quest.status === 'failed');

  const averageProgress = activeQuests.length > 0
    ? Math.round(activeQuests.reduce((sum, quest) => sum + quest.progress, 0) / activeQuests.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">진행 중인 퀘스트</h3>
        <div className="mt-2">
          <p className="text-3xl font-bold text-blue-600">{activeQuests.length}</p>
          <p className="text-sm text-gray-500">평균 진행률: {averageProgress}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">완료된 퀘스트</h3>
        <div className="mt-2">
          <p className="text-3xl font-bold text-green-600">{completedQuests.length}</p>
          <p className="text-sm text-gray-500">성공률: {Math.round((completedQuests.length / (completedQuests.length + failedQuests.length || 1)) * 100)}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">실패한 퀘스트</h3>
        <div className="mt-2">
          <p className="text-3xl font-bold text-red-600">{failedQuests.length}</p>
          <p className="text-sm text-gray-500">실패율: {Math.round((failedQuests.length / (completedQuests.length + failedQuests.length || 1)) * 100)}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900">총 경험치</h3>
        <div className="mt-2">
          <p className="text-3xl font-bold text-purple-600">
            {completedQuests.reduce((sum, quest) => sum + quest.rewards.exp, 0)}
          </p>
          <p className="text-sm text-gray-500">
            포인트: {completedQuests.reduce((sum, quest) => sum + quest.rewards.points, 0)}
          </p>
        </div>
      </div>
    </div>
  );
} 