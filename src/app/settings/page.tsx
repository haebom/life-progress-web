'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { ProfileEditor } from '@/components/ProfileEditor';
import { updateUserProfile } from '@/lib/firebase';
import type { UserProfile } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">로그인이 필요합니다.</p>
      </div>
    );
  }

  const handleUpdate = async (updatedData: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateUserProfile(user.uid, updatedData);
      setUser({ ...user, ...updatedData });
      router.push('/dashboard');
    } catch (error) {
      console.error('설정 업데이트 오류:', error);
      setError('설정 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">설정</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <ProfileEditor
        user={user}
        onUpdate={handleUpdate}
        onCancel={() => router.push('/dashboard')}
        isLoading={isLoading}
      />
    </div>
  );
} 