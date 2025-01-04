'use client';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
  type AuthError
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
  type FirestoreError
} from 'firebase/firestore';
import type { User, GameStats, Quest } from '@/types';

// 필수 환경변수 체크
const requiredEnvVars = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} 환경변수가 설정되지 않았습니다.`);
  }
});

const firebaseConfig = {
  apiKey: requiredEnvVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 커스텀 에러 타입 정의
export type FirebaseError = AuthError | FirestoreError;

// 로그인 상태 타입 정의
export type AuthState = 'logged_in' | 'attempting' | 'logged_out';

// Firebase 초기화
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// 인앱 브라우저 감지
function isInAppBrowser(): boolean {
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
function isSafariBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  return ua.includes('Safari') && !ua.includes('Chrome');
}

// 외부 브라우저로 열기 유도
function openInExternalBrowser(url: string): void {
  if (isInAppBrowser()) {
    window.location.href = `googlechrome://navigate?url=${encodeURIComponent(url)}`;
    setTimeout(() => {
      window.location.href = url;
    }, 2000);
  }
}

// Google 로그인 프로바이더 설정
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

// 브라우저 환경 체크
const isBrowser = typeof window !== 'undefined';

// 스토리지 사용 가능 여부 체크
const isStorageAvailable = (type: 'sessionStorage' | 'localStorage'): boolean => {
  if (!isBrowser) return false;
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

// 도메인 검증
const validateAuthDomain = (): boolean => {
  if (!isBrowser) return true;
  
  const allowedDomains = [
    'localhost:3000',
    'life-progress.vercel.app'  // 실제 배포 도메인
  ];
  
  const currentDomain = window.location.host;
  const isValid = allowedDomains.includes(currentDomain);
  
  if (!isValid) {
    console.warn(`승인되지 않은 도메인에서의 접근: ${currentDomain}`);
  }
  
  return isValid;
};

// Google 로그인 함수
const signInWithGoogle = async () => {
  console.log('Google 로그인 시작');
  
  if (!validateAuthDomain()) {
    throw new Error('승인되지 않은 도메인에서의 접근입니다.');
  }

  if (!isStorageAvailable('sessionStorage')) {
    throw new Error('세션 스토리지를 사용할 수 없습니다.');
  }

  try {
    if (isInAppBrowser()) {
      console.log('인앱 브라우저 감지됨');
      const currentUrl = window.location.href;
      openInExternalBrowser(currentUrl);
      return;
    }

    if (isSafariBrowser()) {
      const result = await signInWithPopup(auth, provider);
      console.log('Google 로그인 팝업 완료:', result.user.uid);
      return result;
    }

    await signInWithRedirect(auth, provider);
    console.log('Google 로그인 리다이렉트 완료');
  } catch (error) {
    console.error('Google 로그인 중 오류:', error);
    throw error;
  }
};

// 리다이렉트 결과 확인 함수
const getGoogleRedirectResult = async () => {
  console.log('리다이렉트 결과 확인 시작');
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('리다이렉트 결과 성공:', result.user.uid);
      sessionStorage.setItem('auth_redirect_complete', 'true');
      return result;
    }
    console.log('리다이렉트 결과 없음');
    return null;
  } catch (error) {
    console.error('리다이렉트 결과 확인 중 오류:', error);
    if (error instanceof Error) {
      console.error('에러 타입:', error.name);
      console.error('에러 메시지:', error.message);
    }
    throw error;
  }
};

// Auth 상태 변경 감지 초기화
const initializeAuth = (callback: (user: FirebaseUser | null) => void) => {
  console.log('Auth 상태 감지 초기화');
  return onAuthStateChanged(auth, async (user) => {
    console.log('Auth 상태 변경:', user ? '로그인됨' : '로그아웃됨');
    if (user) {
      try {
        const userData = await fetchUserData(user.uid);
        if (!userData) {
          const now = Timestamp.now();
          const defaultGameStats: GameStats = {
            level: 1,
            experience: 0,
            questsCompleted: 0,
            points: 0,
            streak: 0,
            lastActive: now,
            achievements: [],
            nextLevelExp: 100
          };

          const newUser: Omit<User, 'id'> = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            birthDate: now,
            lifeExpectancy: 80,
            isPublic: false,
            pushNotifications: true,
            gameStats: defaultGameStats,
            blocks: {},
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            quests: 0,
            level: 1,
            points: 0,
            streak: 0,
            lastActive: now,
            achievements: [],
            settings: {
              theme: 'light',
              notifications: true,
              language: 'ko'
            }
          };
          
          await createNewUser(newUser);
        }
      } catch (error) {
        console.error('사용자 데이터 처리 중 오류:', error);
      }
    }
    callback(user);
  });
};

// 로그아웃 함수
const signOutUser = () => signOut(auth);

// 사용자 데이터 관련 함수들
async function fetchUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('사용자 데이터 불러오기 실패:', error);
    throw error;
  }
}

async function createNewUser(user: Omit<User, 'id'>) {
  try {
    await setDoc(doc(db, 'users', user.uid), user);
  } catch (error) {
    console.error('새 사용자 생성 실패:', error);
    throw error;
  }
}

async function updateUserProfile(uid: string, data: Partial<User>) {
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
async function createQuest(questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) {
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

async function getQuests(userId: string) {
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

async function getQuest(questId: string): Promise<Quest | null> {
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

async function updateQuest(questId: string, updates: Partial<Quest>) {
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

async function deleteQuest(questId: string) {
  try {
    await deleteDoc(doc(db, 'quests', questId));
  } catch (error) {
    console.error('퀘스트 삭제 중 오류 발생:', error);
    throw error;
  }
}

// 알림 관련 인터페이스
export interface NotificationData {
  questId?: string;
  goalId?: string;
  friendId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  progress?: number;
  [key: string]: unknown;
}

// 알림 생성 함수
async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: NotificationData
) {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notification = {
      userId,
      title,
      message,
      type,
      data,
      read: false,
      createdAt: serverTimestamp(),
    };
    
    await addDoc(notificationsRef, notification);
  } catch (error) {
    console.error('알림 생성 중 오류 발생:', error);
    throw error;
  }
}

export class Firebase {
  static app = app;
  static auth = auth;
  static db = db;

  static isInAppBrowser = isInAppBrowser;
  static isSafariBrowser = isSafariBrowser;
  static signInWithGoogle = signInWithGoogle;
  static getGoogleRedirectResult = getGoogleRedirectResult;
  static initializeAuth = initializeAuth;
  static signOutUser = signOutUser;
  static fetchUserData = fetchUserData;
  static createNewUser = createNewUser;
  static updateUserProfile = updateUserProfile;
  static createQuest = createQuest;
  static getQuests = getQuests;
  static getQuest = getQuest;
  static updateQuest = updateQuest;
  static deleteQuest = deleteQuest;
  static createNotification = createNotification;
}

// 하위 호환성을 위한 export
export {
  app,
  auth,
  db,
  isInAppBrowser,
  isSafariBrowser,
  signInWithGoogle,
  getGoogleRedirectResult,
  initializeAuth,
  signOutUser,
  fetchUserData,
  createNewUser,
  updateUserProfile,
  createQuest,
  getQuests,
  getQuest,
  updateQuest,
  deleteQuest,
  createNotification,
}; 