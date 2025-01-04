import { useEffect, useState } from 'react';
import { INSPIRATION_MESSAGES } from '@/lib/messages';

interface YearProgressProps {
  year?: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

export const YearProgress: React.FC<YearProgressProps> = ({ 
  year,
  level,
  experience,
  nextLevelExp
}) => {
  const [progress, setProgress] = useState(0);
  const [localTime, setLocalTime] = useState<Date>(new Date());
  const [message, setMessage] = useState('');
  
  // 랜덤 메시지 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_MESSAGES.length);
    setMessage(INSPIRATION_MESSAGES[randomIndex]);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localNow = new Date(now.toLocaleString('en-US', { timeZone: userTimeZone }));
      const targetYear = year || localNow.getFullYear();
      
      const startOfYear = new Date(Date.UTC(targetYear, 0, 1));
      startOfYear.setMinutes(startOfYear.getMinutes() + startOfYear.getTimezoneOffset());
      
      const endOfYear = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));
      endOfYear.setMinutes(endOfYear.getMinutes() + endOfYear.getTimezoneOffset());
      
      const elapsed = localNow.getTime() - startOfYear.getTime();
      const total = endOfYear.getTime() - startOfYear.getTime();
      const percentage = Math.round((elapsed / total) * 1000) / 10;
      
      setProgress(percentage);
      setLocalTime(localNow);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000);
    return () => clearInterval(interval);
  }, [year]);

  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const expProgress = (experience / nextLevelExp) * 100;

  return (
    <div className="p-4 bg-white">
      {/* 연도 진행률 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">{year || localTime.getFullYear()}년</span>
          <span 
            title={`${timeZoneName} 기준`} 
            className="text-sm text-gray-600 cursor-help"
          >
            {progress.toFixed(3)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 레벨과 경험치 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Level {level}</span>
          <span className="text-sm text-gray-600">{experience} / {nextLevelExp} XP</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${expProgress}%` }}
          />
        </div>
      </div>

      {/* 동기부여 메시지 */}
      <p className="text-sm text-center text-gray-700 mt-4">
        {message}
      </p>
    </div>
  );
}; 