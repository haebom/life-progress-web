'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import type { User } from '@/types';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: Partial<User>[];
  onFollowToggle?: (userId: string) => void;
  currentUserId?: string;
}

export function FollowListModal({
  isOpen,
  onClose,
  title,
  users,
  onFollowToggle,
  currentUserId
}: FollowListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500">목록이 비어있습니다.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.name || '사용자 프로필'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          {(user.name || '?')[0]}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {onFollowToggle && currentUserId !== user.id && user.id && (
                    <button
                      onClick={() => onFollowToggle(user.id)}
                      className="ml-4 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      팔로우
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 