'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { FaTrophy, FaStar, FaMedal } from 'react-icons/fa';
import { Firebase } from '@/lib/firebase';
import type { User, BaseUser } from '@/types';
import StatCard from './StatCard';

interface ProfileViewProps {
  userId: string;
}

const LOADING_PULSE_CLASS = "bg-gray-200 dark:bg-gray-700 rounded animate-pulse";

const ProfileImage = ({ user, loading }: { user: User | null; loading: boolean }) => {
  if (loading) {
    return <div className={`w-24 h-24 ${LOADING_PULSE_CLASS} rounded-full`} />;
  }

  if (user?.photoURL) {
    return (
      <Image
        src={user.photoURL}
        alt={user.displayName || user.name || '프로필 이미지'}
        width={96}
        height={96}
        className="rounded-full"
      />
    );
  }

  return (
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
      <span className="text-2xl text-gray-400 dark:text-gray-500">
        {(user?.displayName || user?.name || '?')[0]}
      </span>
    </div>
  );
};

const LoadingText = ({ width }: { width: string }) => (
  <div className={`h-4 ${LOADING_PULSE_CLASS} ${width}`} />
);

export default function ProfileView({ userId }: ProfileViewProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await Firebase.fetchUserData(userId);
        if (userData) {
          const firebaseUser = Firebase.auth.currentUser;
          if (firebaseUser && firebaseUser.uid === userId) {
            setUser({ ...firebaseUser, ...userData });
          } else {
            const baseUser = {
              uid: userData.uid,
              email: userData.email,
              emailVerified: false,
              isAnonymous: false,
              metadata: {
                creationTime: userData.createdAt.toDate().toISOString(),
                lastSignInTime: userData.lastLoginAt.toDate().toISOString(),
              },
              providerData: [{
                providerId: 'custom',
                uid: userData.uid,
                displayName: userData.displayName,
                email: userData.email,
                phoneNumber: null,
                photoURL: userData.photoURL,
              }],
              refreshToken: '',
              tenantId: null,
              phoneNumber: null,
              providerId: 'custom',
              delete: async () => { throw new Error('Operation not supported'); },
              getIdToken: async () => { throw new Error('Operation not supported'); },
              getIdTokenResult: async () => { throw new Error('Operation not supported'); },
              reload: async () => { throw new Error('Operation not supported'); },
              toJSON: () => ({ uid: userData.uid }),
            } as unknown as BaseUser;
            
            setUser({ ...baseUser, ...userData });
          }
        } else {
          setError('사용자를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('사용자 데이터 로딩 오류:', error);
        setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const statsCards = useMemo(() => [
    {
      title: "퀘스트",
      value: user?.gameStats.questsCompleted || 0,
      icon: FaTrophy,
      description: "완료한 퀘스트 수",
      formatOptions: { useAbbreviation: true }
    },
    {
      title: "레벨",
      value: user?.gameStats.level || 1,
      icon: FaStar,
      description: "현재 달성 레벨"
    },
    {
      title: "포인트",
      value: user?.gameStats.points || 0,
      icon: FaMedal,
      description: "획득한 총 포인트",
      formatOptions: { useAbbreviation: true }
    }
  ], [user?.gameStats]);

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 프로필 헤더 */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="relative w-24 h-24">
          <ProfileImage user={user} loading={loading} />
        </div>
        
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {loading ? (
              <div className={`h-8 ${LOADING_PULSE_CLASS} w-48`} />
            ) : (
              user?.displayName || user?.name || '이름 없음'
            )}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? (
              <LoadingText width="w-32 mt-2" />
            ) : (
              user?.email || '이메일 없음'
            )}
          </p>
        </div>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((card, index) => (
          <StatCard
            key={index}
            {...card}
            isLoading={loading}
          />
        ))}
      </div>

      {/* 추가 프로필 정보 */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          상세 정보
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">가입일</span>
            <span className="text-gray-900 dark:text-white">
              {loading ? (
                <LoadingText width="w-32" />
              ) : (
                user?.createdAt?.toDate().toLocaleDateString() || '알 수 없음'
              )}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">최근 활동</span>
            <span className="text-gray-900 dark:text-white">
              {loading ? (
                <LoadingText width="w-32" />
              ) : (
                user?.gameStats.lastActive?.toDate().toLocaleDateString() || '알 수 없음'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 