'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import useStore from '@/store/useStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NewQuestPage() {
  const router = useRouter();
  const { user } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const timestamp = serverTimestamp();
      await addDoc(collection(db, 'quests'), {
        userId: user.uid,
        title,
        description,
        isShared,
        tags,
        deadline: deadline ? new Date(deadline) : null,
        progress: 0,
        likes: 0,
        comments: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      router.push('/quests');
    } catch (error) {
      console.error('퀘스트 생성 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">새로운 목표 추가</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
              placeholder="목표의 제목을 입력하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded min-h-[100px]"
              required
              placeholder="목표에 대한 상세한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">태그</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full p-2 border rounded"
              placeholder="태그를 입력하고 Enter를 누르세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">마감일 (선택)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isShared"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isShared" className="text-sm">
              다른 사용자와 공유하기
            </label>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 