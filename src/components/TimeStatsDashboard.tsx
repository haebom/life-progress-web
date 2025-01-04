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
  const completedGoals = Object.values(blocks).filter(block => block.progress === 100).length;
  const inProgressGoals = Object.values(blocks).filter(block => block.progress > 0 && block.progress < 100).length;
  const notStartedGoals = Object.values(blocks).filter(block => block.progress === 0).length;

  const data: ChartData[] = [
    { name: '완료된 퀘스트', value: completedGoals, color: '#10B981' },
    { name: '진행 중인 퀘스트', value: inProgressGoals, color: '#3B82F6' },
    { name: '시작하지 않은 퀘스트', value: notStartedGoals, color: '#6B7280' },
  ];

  const totalGoals = Object.values(blocks).length;
  const averageProgress = totalGoals > 0
    ? Math.round(Object.values(blocks).reduce((sum, block) => sum + block.progress, 0) / totalGoals)
    : 0;

  // 최근 7일간 완료된 목표 수 계산
  const lastWeekCompleted = Object.values(blocks).filter(block => {
    const completedDate = block.progress === 100 ? block.updatedAt : null;
    if (!completedDate) return false;
    const daysDiff = Math.floor((new Date().getTime() - completedDate.toDate().getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  }).length;

  return (
    <div className="w-full">
      {/* 도넛 차트 */}
      <div className="h-[180px] md:h-[200px] relative">
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

      {/* 진행률 표시 */}
      <div className="mt-4 space-y-4">
        {/* 전체 달성률 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">전체 퀘스트 달성률</span>
            <span className="text-lg font-bold text-blue-600">{averageProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>

        {/* 이번 주 완료 */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">이번 주 완료</span>
            <span className="text-lg font-bold text-green-600">{lastWeekCompleted}개</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">전체 {completedGoals}개 중</div>
        </div>

        {/* 진행 중인 퀘스트 */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">진행 중인 퀘스트</span>
            <span className="text-lg font-bold text-yellow-600">{inProgressGoals}개</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">전체 {totalGoals}개 중</div>
        </div>
      </div>
    </div>
  );
} 