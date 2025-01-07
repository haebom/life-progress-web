import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Firebase } from '../firebase';
import { useAuthStore } from '@/store/auth';
import type { User, UserProfile } from '@/types';
import type { Auth, GoogleAuthProvider as GoogleAuthProviderType, UserCredential } from 'firebase/auth';

// Firebase Auth 모의 객체
vi.mock('firebase/auth', () => {
  const mockProvider = {
    addScope: vi.fn(),
    setCustomParameters: vi.fn()
  };

  const GoogleAuthProvider = vi.fn(() => mockProvider);
  GoogleAuthProvider.prototype = mockProvider;

  return {
    getAuth: vi.fn(),
    GoogleAuthProvider,
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    getRedirectResult: vi.fn(),
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
    browserLocalPersistence: 'browser',
  };
});

// 브라우저 환경 유틸리티 모의 객체
vi.mock('@/utils/browser', () => ({
  isInAppBrowser: vi.fn(),
  isSafariBrowser: vi.fn(),
  validateDomain: vi.fn(),
}));

describe('Firebase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isLoading: false,
      error: null,
      isInAppBrowser: false,
      isSafari: false,
      isInitialized: false,
      isAuthenticated: false,
    });
  });

  describe('signInWithGoogle', () => {
    it('인앱 브라우저에서 로그인 시도시 in_app_browser 결과를 반환해야 함', async () => {
      const { isInAppBrowser } = await import('@/utils/browser');
      vi.mocked(isInAppBrowser).mockReturnValue(true);

      const result = await Firebase.signInWithGoogle();
      expect(result).toEqual({ type: 'in_app_browser' });
    });

    it('Safari 브라우저에서 로그인 시도시 redirect 결과를 반환해야 함', async () => {
      const { isInAppBrowser, isSafariBrowser } = await import('@/utils/browser');
      const { signInWithRedirect, getAuth, GoogleAuthProvider } = await import('firebase/auth');
      
      vi.mocked(isInAppBrowser).mockReturnValue(false);
      vi.mocked(isSafariBrowser).mockReturnValue(true);
      vi.mocked(signInWithRedirect).mockImplementation(() => Promise.resolve() as Promise<never>);
      const mockAuth = {
        setPersistence: vi.fn().mockResolvedValue(undefined),
      } as unknown as Auth;
      const mockProvider = {
        addScope: vi.fn(),
        setCustomParameters: vi.fn()
      } as unknown as GoogleAuthProviderType;
      vi.mocked(getAuth).mockReturnValue(mockAuth);
      vi.mocked(GoogleAuthProvider).mockImplementation(() => mockProvider);

      const result = await Firebase.signInWithGoogle();
      expect(result).toEqual({ type: 'redirect' });
      expect(signInWithRedirect).toHaveBeenCalledWith(mockAuth, mockProvider);
    });

    it('일반 브라우저에서 로그인 성공시 success 결과를 반환해야 함', async () => {
      const { isInAppBrowser, isSafariBrowser } = await import('@/utils/browser');
      const { signInWithPopup } = await import('firebase/auth');
      
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as unknown as User;

      vi.mocked(isInAppBrowser).mockReturnValue(false);
      vi.mocked(isSafariBrowser).mockReturnValue(false);
      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn'
      } as unknown as UserCredential);

      const result = await Firebase.signInWithGoogle();
      expect(result.type).toBe('success');
      expect(result.user).toBeDefined();
      expect(result.user?.uid).toBe(mockUser.uid);
    });

    it('로그인 실패시 error 결과를 반환해야 함', async () => {
      const { isInAppBrowser, isSafariBrowser } = await import('@/utils/browser');
      const { signInWithPopup } = await import('firebase/auth');
      
      vi.mocked(isInAppBrowser).mockReturnValue(false);
      vi.mocked(isSafariBrowser).mockReturnValue(false);
      vi.mocked(signInWithPopup).mockRejectedValue(new Error('로그인 실패'));

      const result = await Firebase.signInWithGoogle();
      expect(result.type).toBe('error');
      expect(result.message).toBe('로그인 실패');
    });
  });

  describe('getGoogleRedirectResult', () => {
    it('리다이렉트 결과가 있을 경우 success 결과를 반환해야 함', async () => {
      const { getRedirectResult } = await import('firebase/auth');
      
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as unknown as User;

      vi.mocked(getRedirectResult).mockResolvedValue({
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn'
      } as unknown as UserCredential);

      const result = await Firebase.getGoogleRedirectResult();
      expect(result.type).toBe('success');
      expect(result.user).toBeDefined();
      expect(result.user?.uid).toBe(mockUser.uid);
    });

    it('리다이렉트 결과가 없을 경우 no_result를 반환해야 함', async () => {
      const { getRedirectResult } = await import('firebase/auth');
      vi.mocked(getRedirectResult).mockResolvedValue(null);

      const result = await Firebase.getGoogleRedirectResult();
      expect(result.type).toBe('no_result');
    });

    it('리다이렉트 결과 확인 실패시 error 결과를 반환해야 함', async () => {
      const { getRedirectResult } = await import('firebase/auth');
      vi.mocked(getRedirectResult).mockRejectedValue(new Error('리다이렉트 실패'));

      const result = await Firebase.getGoogleRedirectResult();
      expect(result.type).toBe('error');
      expect(result.message).toBe('리다이렉트 실패');
    });
  });
}); 