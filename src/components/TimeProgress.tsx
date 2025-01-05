'use client';

import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { FaClock, FaSun, FaMoon, FaCalendarAlt } from 'react-icons/fa';
import type { QuestItem } from '@/types/notion';

// 영감 메시지 목록
const INSPIRATION_MESSAGES = [
  "매 순간이 새로운 시작입니다.",
  "당신의 시간은 소중합니다.",
  "작은 진전도 큰 변화의 시작입니다.",
  "오늘 하루도 특별한 선물입니다.",
  "지금 이 순간을 살아가세요."
];

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
  const [inspirationMessage, setInspirationMessage] = useState('');
  const [stats, setStats] = useState({
    days: 0,
    months: 0,
    seasons: 0,
    weekends: 0,
    hours: 0,
    sunrises: 0
  });

  // 영감 메시지 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * INSPIRATION_MESSAGES.length);
    setInspirationMessage(INSPIRATION_MESSAGES[randomIndex]);
  }, []);

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

  // 퀘스트 상태 매핑 함수
  const getQuestStatusText = (status: QuestItem['status']) => {
    switch (status) {
      case 'active':
        return '진행 중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      default:
        return '알 수 없음';
    }
  };

  const getQuestStatusStyle = (status: QuestItem['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

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
      {/* 영감 메시지 */}
      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-lg text-white shadow-lg">
        <p className="text-lg font-medium text-center italic">
          {inspirationMessage}
        </p>
      </div>

      {/* 메인 통계 */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            {currentAge.toFixed(8)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">내가 보낸 시간</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaClock className="text-blue-500 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">시간</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.hours.toLocaleString()}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300">시간의 여정</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarAlt className="text-green-500 dark:text-green-400" />
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">계절</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.seasons.toLocaleString()}
            </p>
            <p className="text-xs text-green-500 dark:text-green-300">번의 계절 변화</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaMoon className="text-yellow-500 dark:text-yellow-400" />
              <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">주말</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.weekends.toLocaleString()}
            </p>
            <p className="text-xs text-yellow-500 dark:text-yellow-300">일의 주말</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaSun className="text-purple-500 dark:text-purple-400" />
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">일출</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.sunrises.toLocaleString()}
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-300">번의 일출</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {currentAge.toFixed(1)}년
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {lifeExpectancy}년
            </span>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
            남은 시간: {remaining.toFixed(1)}년
          </p>
        </div>
      </div>

      {/* 퀘스트 섹션 */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          진행 중인 퀘스트
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">진행 중인 퀘스트가 없습니다.</p>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              새 퀘스트 시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quests.map(quest => (
              <div 
                key={quest.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {quest.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getQuestStatusText(quest.status)}
                      {quest.startedAt && ` • ${new Date(quest.startedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getQuestStatusStyle(quest.status)}`}>
                    {getQuestStatusText(quest.status)}
                  </span>
                </div>
                {quest.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">진행률</span>
                      <span className="text-gray-600 dark:text-gray-300">{quest.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                  </div>
                )}
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