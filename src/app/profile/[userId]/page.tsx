'use client';

import ProfileView from '@/components/ProfileView';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

// 정적 경로 생성을 위한 함수
export async function generateStaticParams() {
  try {
    // Firebase에서 사용자 목록 가져오기
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    // 최대 100명까지만 정적 생성 (제한 설정)
    const userIds = snapshot.docs.slice(0, 100).map(doc => ({
      userId: doc.id
    }));

    return userIds;
  } catch (error) {
    console.error('정적 경로 생성 중 오류:', error);
    // 기본값으로 최소한의 경로만 생성
    return [
      { userId: 'default' }
    ];
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <ProfileView userId={params.userId} />;
} 