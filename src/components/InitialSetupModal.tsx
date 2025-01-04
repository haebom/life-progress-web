'use client';

import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Firebase } from '@/lib/firebase';
import type { User } from '@/types';

interface InitialSetupModalProps {
  user: User;
  onComplete: () => void;
  isOpen: boolean;
}

export default function InitialSetupModal({ user, onComplete, isOpen }: InitialSetupModalProps) {
  const [birthDate, setBirthDate] = useState<string>('');
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(80);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await Firebase.updateUserProfile(user.uid, {
        birthDate: Timestamp.fromDate(new Date(birthDate)),
        lifeExpectancy,
      });
      onComplete();
    } catch (error) {
      console.error('초기 설정 저장 중 오류:', error);
      setError('설정을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">초기 설정</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                기대 수명 (년)
              </label>
              <input
                type="number"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(parseInt(e.target.value))}
                min="1"
                max="150"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-4 py-2 bg-blue-500 text-white rounded-md
                  hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 