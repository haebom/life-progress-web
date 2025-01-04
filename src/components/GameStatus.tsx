'use client';

import { LEVEL_THRESHOLDS } from '@/lib/gameSystem';
import type { User } from '@/types';

interface GameStatusProps {
  user: User;
}

export function GameStatus({ user }: GameStatusProps) {
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
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const expInLevel = exp - currentThreshold;
    const expNeeded = nextThreshold - currentThreshold;
    return Math.min((expInLevel / expNeeded) * 100, 100);
  };

  const level = calculateLevel(user.exp || 0);
  const progress = calculateProgress(user.exp || 0);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">게임 상태</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">레벨</p>
          <p className="text-2xl font-bold">{level}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">경험치</p>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 