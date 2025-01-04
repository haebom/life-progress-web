'use client';

import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Block } from '@/types';

interface BlockEditorProps {
  block: Block;
  onSave: (block: Partial<Block>) => void;
  onCancel: () => void;
}

export function BlockEditor({ block, onSave, onCancel }: BlockEditorProps) {
  const [title, setTitle] = useState(block.title);
  const [description, setDescription] = useState(block.description || '');
  const [progress, setProgress] = useState(block.progress);
  const [status, setStatus] = useState(block.status);
  const [dueDateStr, setDueDateStr] = useState(
    block.dueDate ? block.dueDate.toDate().toISOString().split('T')[0] : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      progress: Number(progress),
      status,
      dueDate: dueDateStr ? Timestamp.fromDate(new Date(dueDateStr)) : undefined,
      updatedAt: Timestamp.now(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
            진행률 (%)
          </label>
          <input
            type="number"
            id="progress"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            상태
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Block['status'])}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="active">진행 중</option>
            <option value="completed">완료</option>
            <option value="failed">실패</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            마감일
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDateStr}
            onChange={(e) => setDueDateStr(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            저장
          </button>
        </div>
      </div>
    </form>
  );
} 