'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { BlockMap } from '@/types';

interface TimeStatsDashboardProps {
  blocks: BlockMap;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function TimeStatsDashboard({ blocks }: TimeStatsDashboardProps) {
  const completedQuests = Object.values(blocks).filter(block => block.progress === 100).length;
  const inProgressQuests = Object.values(blocks).filter(block => block.progress > 0 && block.progress < 100).length;
  const notStartedQuests = Object.values(blocks).filter(block => block.progress === 0).length;

  const data: ChartData[] = [
    { name: '완료한 퀘스트', value: completedQuests, color: '#10B981' },
    { name: '도전 중', value: inProgressQuests, color: '#3B82F6' },
    { name: '새로운 모험', value: notStartedQuests, color: '#6B7280' },
  ];

  const totalQuests = Object.values(blocks).length;
  const averageProgress = totalQuests > 0
    ? Math.round(Object.values(blocks).reduce((sum, block) => sum + block.progress, 0) / totalQuests)
    : 0;

  // 최근 7일간 완료된 퀘스트 수 계산
  const lastWeekCompleted = Object.values(blocks).filter(block => {
    const completedDate = block.progress === 100 ? block.updatedAt : null;
    if (!completedDate) return false;
    const daysDiff = Math.floor((new Date().getTime() - completedDate.toDate().getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  }).length;

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">목험 진행 현황</h3>
        <p className="text-sm text-gray-500">당신의 영웅 여정을 함께 응원합니다!</p>
      </div>

      {/* 도넛 차트 */}
      <div className="h-[180px] md:h-[200px] relative mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}개`, '']}
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 전체 진행률 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-1">모험 진행률</h4>
          <p className="text-2xl font-bold text-blue-600">{averageProgress}%</p>
          <div className="mt-2 w-full bg-blue-100 h-2 rounded-full">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>

        {/* 이번 주 완료 */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-1">이번 주 승리</h4>
          <p className="text-2xl font-bold text-green-600">{lastWeekCompleted}개</p>
          <p className="text-xs text-green-700 mt-2">총 {completedQuests}개의 승리 중</p>
        </div>

        {/* 진행 중인 퀘스트 */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-1">도전 중</h4>
          <p className="text-2xl font-bold text-yellow-600">{inProgressQuests}개</p>
          <p className="text-xs text-yellow-700 mt-2">전체 {totalQuests}개의 모험 중</p>
        </div>

        {/* 완료한 퀘스트 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-1">완료한 퀘스트</h4>
          <p className="text-2xl font-bold text-purple-600">{completedQuests}개</p>
          <p className="text-xs text-purple-700 mt-2">영웅의 발자취</p>
        </div>
      </div>
    </div>
  );
} 