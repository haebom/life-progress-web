'use client';

import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query as firestoreQuery,
  where,
  getDocs,
  Timestamp,
  addDoc,
  deleteDoc,
  orderBy,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import type { User, Quest, QuestComment, QuestCheer } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  try {
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    return result.user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
}

export async function fetchUserData(uid: string): Promise<User | null> {
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

export async function createNewUser(user: User) {
  try {
    await setDoc(doc(db, 'users', user.uid), user);
  } catch (error) {
    console.error('새 사용자 생성 실패:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
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

export async function searchUsers(searchQuery: string): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = searchQuery.toLowerCase();
    const querySnapshot = await getDocs(
      firestoreQuery(usersRef, where('displayName', '>=', q), where('displayName', '<=', q + '\uf8ff'))
    );
    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    throw error;
  }
}

interface NotificationData {
  questId?: string;
  goalId?: string;
  friendId?: string;
  senderName?: string;
  senderPhotoURL?: string;
  progress?: number;
  [key: string]: unknown;
}

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

export async function getUserQuests(userId: string): Promise<Quest[]> {
  try {
    const q = firestoreQuery(
      collection(db, 'quests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Quest);
  } catch (error) {
    console.error('퀘스트 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export async function getPublicQuests(): Promise<Quest[]> {
  try {
    const q = firestoreQuery(
      collection(db, 'quests'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Quest);
  } catch (error) {
    console.error('공개 퀘스트 목록을 가져오는 중 오류 발생:', error);
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

export async function updateQuestProgress(questId: string, progress: number) {
  try {
    const questRef = doc(db, 'quests', questId);
    await updateDoc(questRef, {
      progress: Math.min(100, Math.max(0, progress)),
      updatedAt: serverTimestamp(),
      ...(progress >= 100 ? { status: 'completed' } : {}),
    });
  } catch (error) {
    console.error('퀘스트 진행률 업데이트 중 오류 발생:', error);
    throw error;
  }
}

export async function toggleQuestLike(questId: string, userId: string) {
  try {
    const likesRef = collection(db, 'quests', questId, 'likes');
    const q = firestoreQuery(likesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // 좋아요 추가
      await addDoc(likesRef, {
        userId,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'quests', questId), {
        likes: increment(1),
      });
    } else {
      // 좋아요 제거
      const likeDoc = snapshot.docs[0];
      await deleteDoc(doc(db, 'quests', questId, 'likes', likeDoc.id));
      await updateDoc(doc(db, 'quests', questId), {
        likes: increment(-1),
      });
    }
  } catch (error) {
    console.error('퀘스트 좋아요 토글 중 오류 발생:', error);
    throw error;
  }
}

export async function getQuestLikeStatus(questId: string, userId: string): Promise<boolean> {
  try {
    const likesRef = collection(db, 'quests', questId, 'likes');
    const q = firestoreQuery(likesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('퀘스트 좋아요 상태 확인 중 오류 발생:', error);
    throw error;
  }
}

export async function addQuestComment(
  questId: string,
  userId: string,
  userDisplayName: string,
  userPhotoURL: string | null,
  content: string
): Promise<QuestComment> {
  try {
    const commentRef = collection(db, 'quests', questId, 'comments');
    const now = Timestamp.now();
    const comment = {
      questId,
      userId,
      userDisplayName,
      userPhotoURL,
      content,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(commentRef, comment);
    return { id: docRef.id, ...comment } as QuestComment;
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
    throw error;
  }
}

export async function getQuestComments(questId: string): Promise<QuestComment[]> {
  try {
    const q = firestoreQuery(
      collection(db, 'quests', questId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as QuestComment[];
  } catch (error) {
    console.error('댓글 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export async function addQuestCheer(
  questId: string,
  userId: string,
  userDisplayName: string,
  userPhotoURL: string | null,
  message: string
): Promise<QuestCheer> {
  try {
    const cheerRef = collection(db, 'quests', questId, 'cheers');
    const now = Timestamp.now();
    const cheer = {
      questId,
      userId,
      userDisplayName,
      userPhotoURL,
      message,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(cheerRef, cheer);
    return { id: docRef.id, ...cheer } as QuestCheer;
  } catch (error) {
    console.error('응원 메시지 작성 중 오류 발생:', error);
    throw error;
  }
}

export async function getQuestCheers(questId: string): Promise<QuestCheer[]> {
  try {
    const q = firestoreQuery(
      collection(db, 'quests', questId, 'cheers'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as QuestCheer[];
  } catch (error) {
    console.error('응원 메시지 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export { app, auth, db }; 