'use client';

import { useState } from 'react';
import { updateQuest } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Quest } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface QuestEditModalProps {
  quest: Quest;
  onClose: () => void;
  onUpdate: () => void;
}

export function QuestEditModal({ quest, onClose, onUpdate }: QuestEditModalProps) {
  const [formData, setFormData] = useState({
    title: quest.title,
    description: quest.description,
    category: quest.category || '',
    dueDate: quest.dueDate ? quest.dueDate.toDate().toISOString().split('T')[0] : '',
    isPublic: quest.isPublic || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const updatedData = {
        ...formData,
        dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : undefined,
      };
      await updateQuest(quest.id, updatedData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('퀘스트 수정 중 오류:', error);
      setError('퀘스트를 수정하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">퀘스트 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <Input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="">선택하세요</option>
              <option value="개인">개인</option>
              <option value="업무">업무</option>
              <option value="학습">학습</option>
              <option value="건강">건강</option>
              <option value="취미">취미</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              목표 날짜
            </label>
            <Input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              다른 사용자에게 공개하기
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 