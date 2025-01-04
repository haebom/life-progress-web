'use client';

import { useRouter } from 'next/navigation';
import type { Quest } from '@/types';

interface QuestListProps {
  quests: Quest[];
}

export default function QuestList({ quests }: QuestListProps) {
  const router = useRouter();

  if (quests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">진행 중인 퀘스트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <div
          key={quest.id}
          onClick={() => router.push(`/quests/${quest.id}`)}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{quest.title}</h3>
            <span className={`px-2 py-1 text-sm rounded-full
              ${quest.status === 'completed' ? 'bg-green-100 text-green-800' :
                quest.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'}`}
            >
              {quest.status === 'completed' ? '완료' :
               quest.status === 'failed' ? '실패' : '진행중'}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">{quest.description}</p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <p>진행률: {quest.progress}%</p>
            <p>시작일: {quest.startDate.toDate().toLocaleDateString()}</p>
            {quest.dueDate && (
              <p>마감일: {quest.dueDate.toDate().toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 