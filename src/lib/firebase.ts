'use client';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc
} from 'firebase/firestore/lite';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

import { useAuthStore } from '@/store/auth';
import { isInAppBrowser, isSafariBrowser, validateDomain } from '@/utils/browser';
import type { User, UserProfile, AuthResult, Quest } from '@/types';

const AUTHORIZED_DOMAINS = ['localhost', 'life-progress.vercel.app'];

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

class FirebaseService {
  private static instance: FirebaseService;
  private app;
  private auth;
  private db;
  private storage;
  private analytics;
  private provider;
  private authInitialized = false;

  private constructor() {
    this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
    
    if (typeof window !== 'undefined') {
      this.analytics = getAnalytics(this.app);
    }

    this.provider = new GoogleAuthProvider();
    this.provider.addScope('profile');
    this.provider.addScope('email');
    this.provider.setCustomParameters({
      prompt: 'select_account'
    });

    // Initialize auth state listener only once
    if (!this.authInitialized) {
      this.initializeAuthStateListener();
      this.authInitialized = true;
    }
  }

  private initializeAuthStateListener() {
    const { setUser, initialize } = useAuthStore.getState();
    
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await this.fetchUserData(firebaseUser.uid);
          if (userData) {
            setUser({ ...firebaseUser, ...userData } as User);
          } else {
            // If user data doesn't exist, create it
            const userProfile = this.createInitialUserData(firebaseUser);
            await this.createNewUser(userProfile);
            setUser({ ...firebaseUser, ...userProfile } as User);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        initialize();
      }
    });
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private async handleAuthResult(result: { user: FirebaseUser }): Promise<AuthResult> {
    const { setUser } = useAuthStore.getState();
    
    const userData = await this.fetchUserData(result.user.uid);
    if (!userData) {
      const userProfile = this.createInitialUserData(result.user);
      await this.createNewUser(userProfile);
      const newUser = { ...result.user, ...userProfile } as User;
      setUser(newUser);
      return { type: 'success', user: newUser };
    }
    
    await this.updateUserProfile(userData.uid, {
      lastLoginAt: Timestamp.now()
    });
    const updatedUser = { ...result.user, ...userData } as User;
    setUser(updatedUser);
    return { type: 'success', user: updatedUser };
  }

  private handleAuthError(error: unknown): AuthResult {
    console.error('Authentication error:', error);
    
    let message = '로그인 중 오류가 발생했습니다.';
    if (error instanceof Error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/popup-blocked':
          message = '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.';
          break;
        case 'auth/popup-closed-by-user':
          message = '로그인이 취소되었습니다.';
          break;
        case 'auth/cancelled-popup-request':
          message = '로그인 요청이 취소되었습니다.';
          break;
        case 'auth/unauthorized-domain':
          message = '승인되지 않은 도메인입니다.';
          break;
      }
    }
    
    useAuthStore.getState().setError(message);
    return { type: 'error', message };
  }

  public async signInWithGoogle(): Promise<AuthResult> {
    const { setLoading, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError('');
      
      if (!validateDomain(AUTHORIZED_DOMAINS)) {
        throw new Error('승인되지 않은 도메인입니다.');
      }

      if (isInAppBrowser()) {
        return { type: 'in_app_browser' };
      }

      // Always use redirect for Safari, popup for others
      if (isSafariBrowser()) {
        await this.auth.setPersistence(browserLocalPersistence);
        await signInWithRedirect(this.auth, this.provider);
        return { type: 'redirect' };
      }

      try {
        const result = await signInWithPopup(this.auth, this.provider);
        return await this.handleAuthResult(result);
      } catch (popupError: any) {
        // If popup fails, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user') {
          await signInWithRedirect(this.auth, this.provider);
          return { type: 'redirect' };
        }
        throw popupError;
      }
      
    } catch (error) {
      return this.handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }

  public async getGoogleRedirectResult(): Promise<AuthResult> {
    const { setLoading, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError('');
      
      const result = await getRedirectResult(this.auth);
      
      if (result) {
        return await this.handleAuthResult(result);
      }
      
      return { type: 'no_result' };
    } catch (error) {
      return this.handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }

  public async signOut(): Promise<void> {
    const { reset } = useAuthStore.getState();
    await firebaseSignOut(this.auth);
    reset();
  }

  // Firebase 인스턴스 getter
  public getApp() {
    return this.app;
  }

  public getAuth() {
    return this.auth;
  }

  public getDb() {
    return this.db;
  }

  public getStorage() {
    return this.storage;
  }

  public getAnalytics() {
    return this.analytics;
  }

  private createInitialUserData(user: FirebaseUser): UserProfile {
    const now = Timestamp.now();
    return {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
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
      lastActive: now,
      settings: {
        theme: 'light',
        notifications: true,
        language: 'ko'
      },
      followers: [],
      following: [],
      friends: [],
    };
  }

  public async fetchUserData(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('사용자 데이터 조회 실패:', error);
      return null;
    }
  }

  public async createNewUser(user: UserProfile): Promise<void> {
    try {
      await setDoc(doc(this.db, 'users', user.uid), user);
    } catch (error) {
      console.error('새 사용자 생성 실패:', error);
      throw error;
    }
  }

  public async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('사용자 프로필 업데이트 실패:', error);
      throw error;
    }
  }

  public async getQuests(userId: string): Promise<Quest[]> {
    try {
      const questsRef = collection(this.db, 'quests');
      const q = query(questsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quest[];
    } catch (error) {
      console.error('Error fetching quests:', error);
      return [];
    }
  }

  public async createQuest(questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const questsRef = collection(this.db, 'quests');
      const now = Timestamp.now();
      
      await addDoc(questsRef, {
        ...questData,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      console.error('Error creating quest:', error);
      throw error;
    }
  }

  public async getQuest(questId: string): Promise<Quest | null> {
    try {
      const questDoc = await getDoc(doc(this.db, 'quests', questId));
      if (questDoc.exists()) {
        return { id: questDoc.id, ...questDoc.data() } as Quest;
      }
      return null;
    } catch (error) {
      console.error('Error fetching quest:', error);
      throw error;
    }
  }

  public async updateQuest(questId: string, questData: Partial<Quest>): Promise<void> {
    try {
      const questRef = doc(this.db, 'quests', questId);
      const updateData = {
        ...questData,
        updatedAt: Timestamp.now()
      };
      await updateDoc(questRef, updateData);
    } catch (error) {
      console.error('Error updating quest:', error);
      throw error;
    }
  }

  public async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'system' | 'user' | 'quest',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const notificationsRef = collection(this.db, 'notifications');
      const now = Timestamp.now();
      
      await addDoc(notificationsRef, {
        userId,
        title,
        message,
        type,
        metadata,
        read: false,
        createdAt: now
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}

// Firebase 서비스 인스턴스 생성
const firebaseService = FirebaseService.getInstance();

// Firebase 인스턴스 export
export const app = firebaseService.getApp();
export const auth = firebaseService.getAuth();
export const db = firebaseService.getDb();
export const storage = firebaseService.getStorage();
export const analytics = firebaseService.getAnalytics();

// Firebase 서비스 export
export const Firebase = {
  app,
  auth,
  db,
  storage,
  analytics,
  signInWithGoogle: () => firebaseService.signInWithGoogle(),
  getGoogleRedirectResult: () => firebaseService.getGoogleRedirectResult(),
  signOut: () => firebaseService.signOut(),
  fetchUserData: (uid: string) => firebaseService.fetchUserData(uid),
  createNewUser: (user: UserProfile) => firebaseService.createNewUser(user),
  updateUserProfile: (uid: string, data: Partial<UserProfile>) => firebaseService.updateUserProfile(uid, data),
  getQuests: (userId: string) => firebaseService.getQuests(userId),
  createQuest: (questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => firebaseService.createQuest(questData),
  getQuest: (questId: string) => firebaseService.getQuest(questId),
  updateQuest: (questId: string, questData: Partial<Quest>) => firebaseService.updateQuest(questId, questData),
  createNotification: (
    userId: string,
    title: string,
    message: string,
    type: 'system' | 'user' | 'quest',
    metadata?: Record<string, any>
  ) => firebaseService.createNotification(userId, title, message, type, metadata)
};

// Named exports for direct imports
export const {
  signInWithGoogle,
  getGoogleRedirectResult,
  signOut,
  fetchUserData,
  createNewUser,
  updateUserProfile,
  getQuests,
  createQuest,
  getQuest,
  updateQuest,
  createNotification
} = Firebase; 