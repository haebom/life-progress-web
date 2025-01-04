'use client';

import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';

interface AgeCalculatorProps {
  birthDate: Timestamp | null;
}

export function AgeCalculator({ birthDate }: AgeCalculatorProps) {
  const [age, setAge] = useState<number>(0);

  useEffect(() => {
    const calculateAge = () => {
      if (!birthDate) return;

      const now = new Date();
      const birthDateTime = birthDate.toDate();
      const diffInMilliseconds = now.getTime() - birthDateTime.getTime();
      const ageInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
      setAge(ageInYears);
    };

    // Initial calculation
    calculateAge();

    // Update every 100ms for smooth animation
    const interval = setInterval(calculateAge, 100);

    return () => clearInterval(interval);
  }, [birthDate]);

  if (!birthDate) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">내 인생시간</h2>
        <p className="text-gray-600">생년월일을 설정해주세요.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">내 인생시간</h2>
      <div className="text-4xl font-mono">
        {age.toFixed(8)} 세
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="font-bold">{Math.floor(age)}</div>
          <div className="text-gray-600">년</div>
        </div>
        <div>
          <div className="font-bold">{Math.floor((age % 1) * 12)}</div>
          <div className="text-gray-600">개월</div>
        </div>
        <div>
          <div className="font-bold">{Math.floor((age % (1/12)) * 365.25)}</div>
          <div className="text-gray-600">일</div>
        </div>
      </div>
    </div>
  );
} 