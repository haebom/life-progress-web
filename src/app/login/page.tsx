'use client';

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { Firebase } from '@/lib/firebase';
import useStore from '@/store/useStore';
import type { User } from '@/types';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();

  // 페이지 이동 함수
  const navigateTo = useCallback((path: string) => {
    console.log(`페이지 이동: ${path}`);
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }, []);

  // 사용자 데이터 처리 함수
  const processUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      console.log('사용자 데이터 처리 시작:', firebaseUser.uid);
      const userDocRef = doc(Firebase.db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        await updateDoc(userDocRef, { lastLoginAt: Timestamp.now() });
        return userData;
      }
      return null;
    } catch (error) {
      console.error('사용자 데이터 처리 중 오류:', error);
      throw error;
    }
  }, []);

  // 로그인 성공 후 처리
  const handleLoginSuccess = useCallback(async (userData: User) => {
    try {
      console.log('로그인 성공 처리 시작');
      setUser(userData);
      localStorage.setItem('auth_state', 'logged_in');
      localStorage.setItem('user_uid', userData.uid);
      
      // 페이지 이동 전 상태 업데이트 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      navigateTo('/dashboard');
    } catch (error) {
      console.error('로그인 성공 처리 중 오류:', error);
      throw error;
    }
  }, [setUser, navigateTo]);

  // 메인 로그인 핸들러
  const handleUserLogin = useCallback(async (firebaseUser: FirebaseUser) => {
    if (!firebaseUser) {
      console.log('사용자 정보 없음');
      return;
    }

    try {
      setLoading(true);
      console.log('로그인 처리 시작:', firebaseUser.uid);

      const userData = await processUserData(firebaseUser);
      
      if (userData) {
        await handleLoginSuccess(userData);
      } else {
        console.log('신규 사용자 감지');
        navigateTo('/initial-setup');
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, [processUserData, handleLoginSuccess, navigateTo]);

  // Google 로그인 버튼 핸들러
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Google 로그인 시작');
      await Firebase.signInWithGoogle();
      
      // 리디렉트 방식에서는 여기까지 실행됨
      console.log('로그인 프로세스 시작됨');
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  // 리디렉트 결과 처리
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('리디렉트 결과 확인');
        const result = await Firebase.getGoogleRedirectResult();
        if (result.type === 'success' && result.user) {
          console.log('리디렉트 로그인 성공');
          await handleUserLogin(result.user);
        } else if (result.type === 'error') {
          console.error('리디렉트 로그인 실패:', result.message);
          setError(result.message);
        }
      } catch (error) {
        console.error('리디렉트 처리 중 오류:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [handleUserLogin]);

  // 인증 상태 감지
  useEffect(() => {
    console.log('인증 상태 감지 설정');
    
    const unsubscribe = Firebase.auth.onAuthStateChanged(async (user) => {
      console.log('인증 상태 변경:', user ? '로그인됨' : '로그아웃됨');
      if (user) {
        await handleUserLogin(user);
      } else {
        localStorage.clear();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [handleUserLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
} 