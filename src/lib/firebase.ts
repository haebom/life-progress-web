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
  type User as FirebaseUser
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
import type { User, Quest } from '@/types';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyB73bnwE9jTVqiTAvb2BvginUFAgvAcZtw",
  authDomain: "blocks-1b622.firebaseapp.com",
  projectId: "blocks-1b622",
  storageBucket: "blocks-1b622.firebasestorage.app",
  messagingSenderId: "486313931623",
  appId: "1:486313931623:web:2c81258f6c05e2bb8d75c2",
  measurementId: "G-QZH0VBXH25"
};

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
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@example.com'
});

// 승인된 도메인 목록
const AUTHORIZED_DOMAINS = [
  'localhost',
  'localhost:3000',
  'blocks-1b622.firebaseapp.com',
  'blocks-1b622.web.app',
  'life-progress-web.vercel.app'
];

// 도메인 검증
const validateDomain = () => {
  if (typeof window === 'undefined') return true;
  
  const currentDomain = window.location.hostname;
  return AUTHORIZED_DOMAINS.some(domain => 
    currentDomain === domain || 
    currentDomain.endsWith(`.${domain}`)
  );
};

// Google 로그인 함수
const signInWithGoogle = async () => {
  try {
    if (!validateDomain()) {
      throw new Error('승인되지 않은 도메인입니다.');
    }

    if (isInAppBrowser()) {
      const currentUrl = window.location.href;
      openInExternalBrowser(currentUrl);
      return;
    }

    if (isSafariBrowser()) {
      return await signInWithPopup(auth, provider);
    }

    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error('Google 로그인 중 오류:', error);
    throw error;
  }
};

// 리디렉트 결과 확인
const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const userData = await fetchUserData(result.user.uid);
      if (!userData) {
        const now = Timestamp.now();
        const newUser = {
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          birthDate: now,
          lifeExpectancy: 80,
          isPublic: false,
          pushNotifications: true,
          gameStats: {
            level: 1,
            experience: 0,
            questsCompleted: 0,
            points: 0,
            streak: 0,
            lastActive: now,
            achievements: [],
            nextLevelExp: 100
          },
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
    }
    return result;
  } catch (error) {
    console.error('리디렉트 결과 확인 중 오류:', error);
    throw error;
  }
};

// Auth 초기화
const initializeAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 로그아웃 함수
const signOutUser = () => signOut(auth);

// 사용자 데이터 함수들
async function fetchUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as User : null;
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

// 알림 관련 인터페이스와 함수
export interface NotificationData {
  questId?: string;
  goalId?: string;
  friendId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  progress?: number;
  [key: string]: unknown;
}

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