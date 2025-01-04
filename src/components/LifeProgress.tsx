'use client';

import { useMemo } from 'react';
import type { User } from '@/types';

interface LifeProgressProps {
  user: User;
}

export default function LifeProgress({ user }: LifeProgressProps) {
  const { birthDate, lifeExpectancy } = user;
  
  const progress = useMemo(() => {
    const now = new Date();
    const birth = birthDate.toDate();
    const totalDays = lifeExpectancy * 365;
    const livedDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.round((livedDays / totalDays) * 100), 100);
  }, [birthDate, lifeExpectancy]);

  const remainingYears = useMemo(() => {
    const now = new Date();
    const birth = birthDate.toDate();
    const ageInYears = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, Math.round(lifeExpectancy - ageInYears));
  }, [birthDate, lifeExpectancy]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">인생 진행도</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            남은 시간: 약 {remainingYears}년
          </p>
        </div>
      </div>
    </div>
  );
} 