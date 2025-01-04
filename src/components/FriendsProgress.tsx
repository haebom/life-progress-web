'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { User, BlockMap } from '@/types';

interface FriendsProgressProps {
  user: User;
  friends: User[];
}

export function FriendsProgress({ user, friends }: FriendsProgressProps) {
  const [friendsProgress, setFriendsProgress] = useState<Record<string, number>>({});

  const calculateProgress = (blocks: BlockMap): number => {
    if (!blocks || Object.keys(blocks).length === 0) return 0;

    const totalBlocks = Object.keys(blocks).length;
    const completedBlocks = Object.values(blocks).filter(
      (block) => block.status === 'completed'
    ).length;

    return Math.round((completedBlocks / totalBlocks) * 100);
  };

  useEffect(() => {
    const progress: Record<string, number> = {};
    friends.forEach((friend) => {
      progress[friend.id] = calculateProgress(friend.blocks);
    });
    setFriendsProgress(progress);
  }, [friends]);

  const myProgress = calculateProgress(user.blocks);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">나의 진행률</h3>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${myProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{myProgress}%</p>
      </div>

      {friends.map((friend) => (
        <div key={friend.id} className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            {friend.photoURL && (
              <div className="relative w-8 h-8">
                <Image
                  src={friend.photoURL}
                  alt={friend.displayName || '친구'}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold">
              {friend.displayName || '친구'}의 진행률
            </h3>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${friendsProgress[friend.id] || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {friendsProgress[friend.id] || 0}%
          </p>
        </div>
      ))}
    </div>
  );
} 