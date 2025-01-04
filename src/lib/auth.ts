'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '@/types';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...userDoc.data()
            } as User);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('사용자 정보 로딩 중 오류:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<User>
) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, profile);
  } catch (error) {
    console.error('사용자 프로필 업데이트 실패:', error);
    throw new AuthError('프로필 업데이트에 실패했습니다.');
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<User>
) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, settings);
  } catch (error) {
    console.error('사용자 설정 업데이트 실패:', error);
    throw new AuthError('설정 업데이트에 실패했습니다.');
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('사용자 프로필을 불러오는 중 오류 발생:', error);
    throw new AuthError('프로필을 불러올 수 없습니다.');
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('비밀번호 재설정 이메일 전송 중 오류 발생:', error);
    throw new AuthError('비밀번호 재설정 이메일을 보낼 수 없습니다.');
  }
} 