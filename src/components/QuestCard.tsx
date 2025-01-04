'use client';

import type { Quest } from '@/types';

interface QuestCardProps {
  quest: Quest;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  likeCount?: number;
  isLiked?: boolean;
}

export function QuestCard({ quest, onEdit, onDelete, onLike, likeCount = 0, isLiked = false }: QuestCardProps) {
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
          <h3 className="text-lg font-semibold text-gray-900">{quest.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{quest.description}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>진행률</span>
            <span>{quest.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${quest.progress}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">상태: {quest.status}</span>
          {quest.dueDate && (
            <span className="text-gray-600">
              마감일: {formatDate(quest.dueDate.toDate())}
            </span>
          )}
        </div>
        {quest.tags && quest.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {quest.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {onLike && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                isLiked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{likeCount}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 