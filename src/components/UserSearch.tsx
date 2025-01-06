'use client';

import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

interface UserSearchProps {
  currentUserId: string;
  onSelect: (user: UserProfile) => void;
}

export function UserSearch({ currentUserId, onSelect }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({ ...doc.data(), uid: doc.id }) as UserProfile)
        .filter(user => user.uid !== currentUserId);

      setSearchResults(results);
    } catch (err) {
      console.error('사용자 검색 중 오류 발생:', err);
      setError('사용자 검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="사용자 이름으로 검색..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          검색
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">검색 중...</div>
      ) : (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.uid}
              onClick={() => onSelect(user)}
              className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ))}
          {searchResults.length === 0 && searchTerm && (
            <div className="text-center py-4 text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 