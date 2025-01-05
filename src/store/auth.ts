import { create } from 'zustand';
import type { AuthState, User } from '@/types';

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  isInAppBrowser: false,
  isSafari: false,
};

interface AuthActions {
  initialize: () => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setInAppBrowser: (isInAppBrowser: boolean) => void;
  setSafari: (isSafari: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  initialize: () => set({ isInitialized: true }),
  
  setUser: (user) => set({ 
    user,
    isAuthenticated: !!user,
    error: null 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ 
    error,
    isLoading: false 
  }),
  
  setInAppBrowser: (isInAppBrowser) => set({ isInAppBrowser }),
  
  setSafari: (isSafari) => set({ isSafari }),
  
  reset: () => set(initialState),
})); 