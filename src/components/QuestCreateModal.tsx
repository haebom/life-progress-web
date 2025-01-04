'use client';

import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Quest } from '@/types';

interface QuestCreateModalProps {
  userId: string;
  onSave: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function QuestCreateModal({ userId, onSave, onClose }: QuestCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Timestamp.now();
    onSave({
      userId,
      title,
      description,
      category,
      status: 'active' as const,
      progress: 0,
      isPublic,
      startDate: now,
      rewards: {
        exp: 100,
        points: 50
      },
      tags: [],
      isShared: false,
      priority: 'medium',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">새로운 퀘스트</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
              공개 설정
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 