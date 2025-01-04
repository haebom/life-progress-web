'use client';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  addDoc,
} from 'firebase/firestore';
import type { User as CustomUser, Quest } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 초기화
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// 인앱 브라우저 감지
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  return (
    ua.includes('FBAN') || // Facebook
    ua.includes('FBAV') || // Facebook
    ua.includes('Twitter') || // Twitter
    ua.includes('Instagram') || // Instagram
    ua.includes('Line') || // Line
    ua.includes('KAKAOTALK') // KakaoTalk
  );
}

// Safari 브라우저 감지
export function isSafariBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  return ua.includes('Safari') && !ua.includes('Chrome');
}

// 외부 브라우저로 열기 유도
export function openInExternalBrowser(url: string): void {
  if (isInAppBrowser()) {
    // 모바일 Safari로 열기
    window.location.href = `googlechrome://navigate?url=${encodeURIComponent(url)}`;
    // 시간 차를 두고 Safari로 시도
    setTimeout(() => {
      window.location.href = url;
    }, 2000);
  }
}

// Google 로그인 프로바이더 설정
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

// Google 로그인 함수
const signInWithGoogle = async () => {
  console.log('Google 로그인 시작');
  try {
    // 인앱 브라우저 체크
    if (isInAppBrowser()) {
      console.log('인앱 브라우저 감지됨');
      const currentUrl = window.location.href;
      openInExternalBrowser(currentUrl);
      return;
    }

    await signInWithRedirect(auth, provider);
    console.log('Google 로그인 리다이렉트 완료');
  } catch (error) {
    console.error('Google 로그인 중 오류:', error);
    throw error;
  }
};

// 로그아웃 함수
const signOutUser = () => signOut(auth);

// 리다이렉트 결과 확인 함수
const getGoogleRedirectResult = async () => {
  console.log('리다이렉트 결과 확인 시작');
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('리다이렉트 결과 성공:', result.user.uid);
      sessionStorage.setItem('auth_redirect_complete', 'true');
      localStorage.setItem('auth_redirect_complete', 'true');
      return result;
    }
    console.log('리다이렉트 결과 없음');
    return null;
  } catch (error) {
    console.error('리다이렉트 결과 확인 중 오류:', error);
    throw error;
  }
};

// Auth 상태 변경 감지 초기화
const initializeAuth = (callback: (user: User | null) => void) => {
  console.log('Auth 상태 감지 초기화');
  return onAuthStateChanged(auth, (user) => {
    console.log('Auth 상태 변경:', user ? '로그인됨' : '로그아웃됨');
    callback(user);
  });
};

// 사용자 데이터 관련 함수들
export async function fetchUserData(uid: string): Promise<CustomUser | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as CustomUser;
    }
    return null;
  } catch (error) {
    console.error('사용자 데이터 불러오기 실패:', error);
    throw error;
  }
}

export async function createNewUser(user: CustomUser) {
  try {
    await setDoc(doc(db, 'users', user.uid), user);
  } catch (error) {
    console.error('새 사용자 생성 실패:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<CustomUser>) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    throw error;
  }
}

// Quest 관련 함수들
export async function createQuest(questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const questRef = doc(collection(db, 'quests'));
    const now = Timestamp.now();
    const quest: Quest = {
      id: questRef.id,
      ...questData,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(questRef, quest);
    return quest;
  } catch (error) {
    console.error('퀘스트 생성 중 오류 발생:', error);
    throw error;
  }
}

export async function getQuests(userId: string) {
  if (!userId) {
    console.error('유저 ID가 없습니다.');
    return [];
  }

  try {
    const questsRef = collection(db, 'quests');
    const q = query(questsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as DocumentData)
    })) as Quest[];
  } catch (error) {
    console.error('퀘스트 목록 조회 오류:', error);
    throw error;
  }
}

export async function getQuest(questId: string): Promise<Quest | null> {
  try {
    const questDoc = await getDoc(doc(db, 'quests', questId));
    if (questDoc.exists()) {
      return questDoc.data() as Quest;
    }
    return null;
  } catch (error) {
    console.error('퀘스트를 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export async function updateQuest(questId: string, updates: Partial<Quest>) {
  try {
    const questRef = doc(db, 'quests', questId);
    await updateDoc(questRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('퀘스트 업데이트 중 오류 발생:', error);
    throw error;
  }
}

export async function deleteQuest(questId: string) {
  try {
    await deleteDoc(doc(db, 'quests', questId));
  } catch (error) {
    console.error('퀘스트 삭제 중 오류 발생:', error);
    throw error;
  }
}

// 알림 관련 인터페이스
interface NotificationData {
  questId?: string;
  goalId?: string;
  friendId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  progress?: number;
  [key: string]: unknown;
}

// 알림 생성 함수
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: NotificationData
) {
  try {
    const notificationRef = collection(db, 'notifications');
    await addDoc(notificationRef, {
      userId,
      title,
      message,
      type,
      data,
      createdAt: Timestamp.now(),
      read: false,
    });
  } catch (error) {
    console.error('알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export {
  app,
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  getGoogleRedirectResult,
  initializeAuth,
}; 