'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@/types';

interface UserSearchProps {
  currentUserId: string;
  onFollowUser: (userId: string) => Promise<void>;
}

export const UserSearch = ({ currentUserId, onFollowUser }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '>=', searchQuery.toLowerCase()),
        where('email', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }) as User)
        .filter(user => user.id !== currentUserId);

      setSearchResults(results);
    } catch (error) {
      console.error('사용자 검색 중 오류 발생:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="사용자 이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? '검색 중...' : '검색'}
        </Button>
      </div>

      <div className="space-y-4">
        {searchResults.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <div className="relative w-12 h-12">
                  <Image
                    src={user.photoURL}
                    alt={user.name || ''}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                  {user.name?.[0]}
                </div>
              )}
              <div>
                <Link
                  href={`/profile/${user.id}`}
                  className="font-medium hover:underline"
                >
                  {user.name}
                </Link>
                {user.bio && (
                  <p className="text-sm text-gray-600">{user.bio}</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => user.id && onFollowUser(user.id)}
              variant="outline"
              size="sm"
            >
              팔로우
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}; 