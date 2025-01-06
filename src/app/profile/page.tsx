'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { ProfileEditor } from '@/components/ProfileEditor';
import { updateUserProfile } from '@/lib/auth';
import type { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
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

  const handleUpdate = async (updatedData: User) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateUserProfile(user.uid, updatedData);
      setUser(updatedData);
      router.push('/dashboard');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">프로필 설정</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
        <ProfileEditor
          user={user}
          onUpdate={handleUpdate}
          onCancel={() => router.push('/dashboard')}
          isLoading={isLoading}
        />
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">서비스 연동</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Notion 데이터베이스 연동</h3>
              <p className="text-sm text-gray-500">퀘스트와 목표를 Notion에서 관리하고 동기화합니다.</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Google Calendar 연동</h3>
              <p className="text-sm text-gray-500">일정과 마일스톤을 Google Calendar와 동기화합니다.</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">GitHub 연동</h3>
              <p className="text-sm text-gray-500">개발 관련 목표를 GitHub 활동과 연동합니다.</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">푸시 알림</h3>
              <p className="text-sm text-gray-500">목표 달성 현황과 중요 알림을 푸시로 받습니다.</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">주간 리포트</h3>
              <p className="text-sm text-gray-500">주간 목표 달성 현황과 인사이트를 이메일로 받습니다.</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">월간 회고 알림</h3>
              <p className="text-sm text-gray-500">매월 말 회고 작성 시점에 알림을 받습니다.</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 