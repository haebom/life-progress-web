'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/lib/firebase';
import type { User } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface InitialSetupModalProps {
  user: User | null;
  setUser: (data: User | null | ((prev: User | null) => User | null)) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function InitialSetupModal({
  user,
  setUser,
  isOpen,
  onClose,
}: InitialSetupModalProps) {
  const [formData, setFormData] = useState({
    birthDate: '',
    lifeExpectancy: 80,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      birthDate: Timestamp.fromDate(new Date(formData.birthDate)),
      lifeExpectancy: formData.lifeExpectancy,
    };

    try {
      if (user) {
        await updateUserProfile(user.uid, updatedData);
        setUser((prevData: User | null) => {
          if (!prevData) return null;
          return {
            ...prevData,
            ...updatedData,
          };
        });
      }
      onClose();
    } catch (error) {
      console.error('초기 설정 중 오류 발생:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">기본 정보 설정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              생년월일
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              기대수명 (년)
            </label>
            <input
              type="number"
              value={formData.lifeExpectancy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lifeExpectancy: parseInt(e.target.value),
                })
              }
              min="1"
              max="150"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            설정 완료
          </button>
        </form>
      </div>
    </div>
  );
} 