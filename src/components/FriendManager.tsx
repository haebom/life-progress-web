'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

interface FriendManagerProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export function FriendManager({ user, onUpdate }: FriendManagerProps) {
  const [friendId, setFriendId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedFriends = [...(user.friends || []), friendId];
      
      await updateDoc(userRef, {
        friends: arrayUnion(friendId)
      });

      onUpdate({
        ...user,
        friends: updatedFriends
      });

      setFriendId('');
    } catch (error) {
      console.error('친구 추가 중 오류:', error);
      setError('친구를 추가하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendIdToRemove: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedFriends = (user.friends || []).filter(id => id !== friendIdToRemove);
      
      await updateDoc(userRef, {
        friends: arrayRemove(friendIdToRemove)
      });

      onUpdate({
        ...user,
        friends: updatedFriends
      });
    } catch (error) {
      console.error('친구 삭제 중 오류:', error);
      setError('친구를 삭제하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddFriend} className="space-y-4">
        <div>
          <label htmlFor="friendId" className="block text-sm font-medium text-gray-700">
            친구 ID
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="friendId"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="친구의 ID를 입력하세요"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !friendId.trim()}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? '처리중...' : '추가'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">친구 목록</h3>
        {user.friends && user.friends.length > 0 ? (
          <ul className="mt-3 divide-y divide-gray-200">
            {user.friends.map((friendId) => (
              <li key={friendId} className="py-4 flex justify-between items-center">
                <span className="text-sm text-gray-900">{friendId}</span>
                <button
                  onClick={() => handleRemoveFriend(friendId)}
                  disabled={isLoading}
                  className="ml-3 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">아직 친구가 없습니다.</p>
        )}
      </div>
    </div>
  );
} 