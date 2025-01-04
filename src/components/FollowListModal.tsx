'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { User } from '@/types';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: Array<Pick<User, 'uid' | 'email' | 'displayName' | 'name' | 'photoURL' | 'isFollowing'>>;
  currentUserId: string;
  onFollow?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
}

export default function FollowListModal({
  isOpen,
  onClose,
  title,
  users,
  currentUserId,
  onFollow,
  onUnfollow,
}: FollowListModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2 space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.uid}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName || user.name || '프로필 이미지'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {(user.displayName || user.name || '?')[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.displayName || user.name || '이름 없음'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {user.uid !== currentUserId && (onFollow || onUnfollow) && (
                        <button
                          onClick={() =>
                            user.isFollowing && user.uid
                              ? onUnfollow?.(user.uid)
                              : user.uid && onFollow?.(user.uid)
                          }
                          className={`
                            px-3 py-1 rounded-full text-sm font-medium
                            ${
                              user.isFollowing
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                : 'bg-blue-500 text-white'
                            }
                            hover:opacity-90 transition-opacity
                          `}
                        >
                          {user.isFollowing ? '팔로잉' : '팔로우'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 