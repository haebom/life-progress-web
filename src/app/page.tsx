'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LifeProgress from '@/components/LifeProgress';
import useStore from '@/store/useStore';

export default function HomePage() {
  const { user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {user.name || '사용자'}님!
          </h1>
          <p className="text-gray-600">
            오늘도 목표를 향해 한 걸음 더 나아가보세요.
          </p>
        </div>

        <div className="space-y-6">
          <LifeProgress user={user} />

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">오늘의 할 일</h2>
            {/* 여기에 할 일 목록 컴포넌트 추가 예정 */}
            <p className="text-gray-500">아직 등록된 할 일이 없습니다.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
            {/* 여기에 활동 목록 컴포넌트 추가 예정 */}
            <p className="text-gray-500">아직 기록된 활동이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
