'use client';

import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { INSPIRATION_MESSAGES } from '@/lib/messages';

interface TimeProgressProps {
  birthDate?: Timestamp | Date | string;
  lifeExpectancy?: number;
}

const TimeProgress: React.FC<TimeProgressProps> = ({ 
  birthDate, 
  lifeExpectancy = 80 
}) => {
  const [currentAge, setCurrentAge] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [stats, setStats] = useState({
    days: 0,
    months: 0,
    seasons: 0,
    weekends: 0,
    hours: 0,
    sunrises: 0
  });

  useEffect(() => {
    if (!birthDate) return;

    const getBirthDate = () => {
      if (birthDate instanceof Timestamp) {
        return birthDate.toDate();
      } else if (birthDate instanceof Date) {
        return birthDate;
      } else {
        return new Date(birthDate);
      }
    };

    const birthDateTime = getBirthDate();
    
    const calculateAge = () => {
      const now = new Date();
      const ageInMs = now.getTime() - birthDateTime.getTime();
      const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
      
      // 상세 통계 계산
      const days = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
      const months = Math.floor(days / 30.44); // 평균 월 길이 사용
      const seasons = Math.floor(months / 3); // 계절 수
      const weekends = Math.floor(days / 7) * 2; // 주말 일수 (토,일)
      const hours = Math.floor(ageInMs / (1000 * 60 * 60));
      const sunrises = days; // 일출 횟수 (하루에 한 번)

      setCurrentAge(ageInYears);
      setRemaining(lifeExpectancy - ageInYears);
      setStats({ days, months, seasons, weekends, hours, sunrises });
    };

    calculateAge();
    const interval = setInterval(calculateAge, 50);

    return () => clearInterval(interval);
  }, [birthDate, lifeExpectancy]);

  if (!birthDate || !lifeExpectancy) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <p className="text-yellow-700 dark:text-yellow-200">생년월일 또는 기대수명 정보가 없습니다. 프로필에서 정보를 입력해주세요.</p>
      </div>
    );
  }

  const progressPercentage = (currentAge / lifeExpectancy) * 100;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {currentAge.toFixed(8)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">내가 보낸 시간</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.days.toLocaleString()}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">일째의 여정</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.seasons.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400">번의 계절 변화</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.weekends.toLocaleString()}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">일의 주말</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.sunrises.toLocaleString()}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400">번의 일출</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          남은 시간: {remaining.toFixed(8)}년
        </p>
      </div>
    </div>
  );
};

export default TimeProgress; 