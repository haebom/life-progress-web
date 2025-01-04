'use client';

import Image from 'next/image';
import useStore from '@/store/useStore';
import { useEffect } from 'react';
import { fetchUserData } from '@/lib/firebase';

interface ProfileContentProps {
  userId: string;
}

const ProfileContent = ({ userId }: ProfileContentProps) => {
  const { user, setUser } = useStore();

  useEffect(() => {
    const loadUserData = async () => {
      const data = await fetchUserData(userId);
      if (data) {
        setUser(data);
      }
    };
    loadUserData();
  }, [userId, setUser]);

  if (!user || !user.gameStats) {
    return <div>로딩 중...</div>;
  }

  const { gameStats } = user;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 프로필 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.name || '사용자 프로필'}
              width={100}
              height={100}
              className="rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-500">👤</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name || '이름 없음'}</h1>
            <p className="text-gray-600">{user.bio || '소개가 없습니다.'}</p>
            <div className="mt-2 text-sm text-gray-500">
              가입일: {user.createdAt.toDate().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* 게임 통계 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-600">Lv. {gameStats.level}</div>
            <div className="text-sm text-gray-600">레벨</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-green-600">{gameStats.points}</div>
            <div className="text-sm text-gray-600">포인트</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-yellow-600">{gameStats.questsCompleted}</div>
            <div className="text-sm text-gray-600">완료한 퀘스트</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-purple-600">{gameStats.streak}</div>
            <div className="text-sm text-gray-600">연속 달성</div>
          </div>
        </div>

        {/* 마지막 활동 */}
        <div className="mt-4 text-sm text-gray-500">
          마지막 활동: {gameStats.lastActive 
            ? gameStats.lastActive.toDate().toLocaleDateString()
            : '활동 기록 없음'}
        </div>
      </div>

      {/* 업적 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">업적</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gameStats.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="p-4 rounded-lg bg-green-50 border border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      달성일: {achievement.unlockedAt.toDate().toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent; 