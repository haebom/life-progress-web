'use client';

import { LEVEL_THRESHOLDS } from '@/lib/gameSystem';
import type { User } from '@/types';

interface GameStatusProps {
  user: User;
}

export default function GameStatus({ user }: GameStatusProps) {
  const calculateLevel = (exp: number) => {
    let level = 1;
    for (const threshold of LEVEL_THRESHOLDS) {
      if (exp >= threshold) {
        level++;
      } else {
        break;
      }
    }
    return level;
  };

  const calculateProgress = (exp: number) => {
    const level = calculateLevel(exp);
    const currentLevelThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelThreshold = LEVEL_THRESHOLDS[level] || currentLevelThreshold * 2;
    const expInCurrentLevel = exp - currentLevelThreshold;
    const expNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
    return (expInCurrentLevel / expNeededForNextLevel) * 100;
  };

  const level = calculateLevel(user.gameStats?.experience || 0);
  const progress = calculateProgress(user.gameStats?.experience || 0);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">레벨 {level}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.gameStats?.experience || 0} EXP
        </span>
      </div>
      
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {user.gameStats?.questsCompleted || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">완료한 퀘스트</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {user.gameStats?.streak || 0}일
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">연속 달성</p>
        </div>
      </div>
    </div>
  );
} 