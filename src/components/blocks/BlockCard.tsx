'use client';

import type { Block } from '@/types';

interface BlockCardProps {
  block: Block;
  onEdit: () => void;
  onDelete: () => void;
}

export function BlockCard({ block, onEdit, onDelete }: BlockCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{block.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            수정
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-800"
          >
            삭제
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>진행률</span>
            <span>{block.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${block.progress}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">상태: {block.status}</span>
          {block.dueDate && (
            <span className="text-gray-600">
              마감일: {formatDate(block.dueDate.toDate())}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 