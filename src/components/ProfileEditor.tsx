'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import type { User } from '@/types';

interface ProfileEditorProps {
  user: User;
  onCancel: () => void;
  onUpdate: (updatedUser: User) => void;
  isLoading?: boolean;
}

export function ProfileEditor({ user, onCancel, onUpdate, isLoading }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    displayName: user.displayName || '',
    birthDate: user.birthDate
      ? user.birthDate.toDate().toISOString().split('T')[0]
      : '',
    lifeExpectancy: user.lifeExpectancy || 80,
    bio: user.bio || '',
    isPublic: user.isPublic,
    pushNotifications: user.pushNotifications,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: Partial<User> = {
      name: formData.name,
      displayName: formData.displayName,
      birthDate: Timestamp.fromDate(new Date(formData.birthDate)),
      lifeExpectancy: formData.lifeExpectancy,
      bio: formData.bio,
      isPublic: formData.isPublic,
    };

    try {
      await updateUserProfile(user.uid, updatedUser);
      onUpdate({
        ...user,
        ...updatedUser,
      } as User);
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          이름
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          표시 이름
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          생년월일
        </label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          기대수명
        </label>
        <input
          type="number"
          min="1"
          max="150"
          value={formData.lifeExpectancy}
          onChange={(e) => setFormData({ ...formData, lifeExpectancy: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          소개
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm text-gray-900">
          프로필 공개
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
} 