'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { getUserProfile } from '@/lib/auth';
import type { User } from '@/types';
import Image from 'next/image';
import { YearProgress } from './YearProgress';
import { MessageManager } from './MessageManager';

interface ProfileViewProps {
  userId: string;
}

export function ProfileView({ userId }: ProfileViewProps) {
  const router = useRouter();
  const { user } = useStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signup');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        if (data) {
          setProfileUser(data);
        } else {
          setError('사용자를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로필 불러오기 실패:', error);
        setError('프로필을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, userId, router]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">로그인이 필요합니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">프로필을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">사용자를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          {profileUser.photoURL ? (
            <div className="relative w-16 h-16 mr-4">
              <Image
                src={profileUser.photoURL}
                alt={profileUser.displayName || '사용자 프로필'}
                fill
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-gray-500">
                {(profileUser.displayName || '?')[0]}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {profileUser.displayName || '이름 없음'}
            </h1>
            <p className="text-gray-600">{profileUser.email}</p>
          </div>
        </div>

        <div className="mb-8">
          <YearProgress 
            level={profileUser.gameStats.level}
            experience={profileUser.gameStats.experience}
            nextLevelExp={profileUser.gameStats.nextLevelExp}
          />
        </div>

        {profileUser.bio && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">소개</h2>
            <p className="text-gray-700">{profileUser.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">퀘스트</p>
            <p className="text-lg font-semibold">
              {profileUser.gameStats.questsCompleted}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">레벨</p>
            <p className="text-lg font-semibold">
              {profileUser.gameStats.level}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">포인트</p>
            <p className="text-lg font-semibold">
              {profileUser.gameStats.points}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 