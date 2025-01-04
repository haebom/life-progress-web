'use client';

import { Progress } from '@/components/ui/Progress';

interface GoalProgressChartProps {
  blocks: {
    [key: string]: {
      title: string;
      description?: string;
      progress: number;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

export function GoalProgressChart({ blocks }: GoalProgressChartProps) {
  const blockValues = Object.values(blocks);
  const currentGoals = blockValues.length;
  const completedGoals = blockValues.filter(block => block.progress === 100).length;
  const inProgressGoals = blockValues.filter(block => block.progress > 0 && block.progress < 100).length;

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-6">나의 성장 기록</h2>
      
      {/* 퀘스트 상태 분포 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-600">{currentGoals}</div>
          <div className="text-xs text-gray-600">전체 퀘스트</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-600">{completedGoals}</div>
          <div className="text-xs text-gray-600">완료됨</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-yellow-600">{inProgressGoals}</div>
          <div className="text-xs text-gray-600">진행 중</div>
        </div>
      </div>

      {/* 개별 퀘스트 진행률 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">개별 퀘스트 진행률</h3>
        {blockValues.map((block) => (
          <div key={block.title} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-700 truncate">{block.title}</span>
              <span className="text-xs text-gray-500 ml-2">{block.progress}%</span>
            </div>
            <Progress 
              value={block.progress} 
              className="h-1.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 