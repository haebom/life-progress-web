'use client';

import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { QuestItem } from '@/types/notion';

// 재사용 가능한 에러 바운더리 컴포넌트
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('TimeProgress 컴포넌트 에러:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-200">
          컴포넌트 로딩 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

interface TimeProgressProps {
  birthDate?: Timestamp | Date | string;
  lifeExpectancy?: number;
  userId: string;
}

const TimeProgress: React.FC<TimeProgressProps> = ({ 
  birthDate, 
  lifeExpectancy = 80,
  userId 
}) => {
  const [currentAge, setCurrentAge] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [stats, setStats] = useState({
    days: 0,
    months: 0,
    seasons: 0,
    weekends: 0,
    hours: 0,
    sunrises: 0
  });

  // 퀘스트 목록 가져오기
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchQuests = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(
          `/api/notion?action=getQuests&userId=${encodeURIComponent(userId)}`,
          { signal: controller.signal }
        );
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '퀘스트를 불러오는 중 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        if (isMounted) {
          setQuests(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('퀘스트 로딩 중 오류:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : '퀘스트를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuests();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId]);

  // 나이 계산 로직
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
      const months = Math.floor(days / 30.44);
      const seasons = Math.floor(months / 3);
      const weekends = Math.floor(days / 7) * 2;
      const hours = Math.floor(ageInMs / (1000 * 60 * 60));
      const sunrises = days;

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

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }

  const progressPercentage = (currentAge / lifeExpectancy) * 100;

  return (
    <div className="space-y-6">
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

      {/* 퀘스트 목록 섹션 */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          진행 중인 퀘스트
        </h3>
        
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">진행 중인 퀘스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quests.map(quest => (
              <div 
                key={quest.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">{quest.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    상태: {quest.status}
                    {quest.startedAt && ` • 시작일: ${new Date(quest.startedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 에러 바운더리로 감싸서 내보내기
export default function TimeProgressWithErrorBoundary(props: TimeProgressProps) {
  return (
    <ErrorBoundary>
      <TimeProgress {...props} />
    </ErrorBoundary>
  );
} 