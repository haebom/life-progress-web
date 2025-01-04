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
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    days: 0,
    months: 0,
    seasons: 0,
    weekends: 0,
    hours: 0,
    sunrises: 0
  });

  // 랜덤 메시지 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_MESSAGES.length);
    setMessage(INSPIRATION_MESSAGES[randomIndex]);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

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
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">생년월일 또는 기대수명 정보가 없습니다. 프로필에서 정보를 입력해주세요.</p>
      </div>
    );
  }

  const progressPercentage = (currentAge / lifeExpectancy) * 100;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <div className="text-center mb-4">
          <h2 className="text-4xl font-mono font-bold text-blue-600">
            {currentAge.toFixed(8)}세
          </h2>
          <p className="text-gray-500 mt-1">내가 보낸 시간</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-3xl font-mono font-semibold text-blue-600">{stats.days.toLocaleString()}</p>
            <p className="text-sm text-blue-600">일째의 여정</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-3xl font-mono font-semibold text-green-600">{stats.seasons.toLocaleString()}</p>
            <p className="text-sm text-green-600">번의 계절 변화</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-mono font-semibold text-yellow-600">{stats.weekends.toLocaleString()}</p>
            <p className="text-sm text-yellow-600">일의 주말</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-3xl font-mono font-semibold text-purple-600">{stats.sunrises.toLocaleString()}</p>
            <p className="text-sm text-purple-600">번의 일출</p>
          </div>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-50"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-center mt-4">
          <p className="text-lg font-mono text-gray-600">
            남은 시간: {remaining.toFixed(8)}년
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeProgress; 