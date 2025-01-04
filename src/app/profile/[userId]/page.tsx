import ProfileView from '@/components/ProfileView';
import { db } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export async function generateStaticParams() {
  try {
    if (!db) {
      console.warn('Firebase Admin이 초기화되지 않았습니다.');
      return [{ userId: 'default' }];
    }

    const usersRef = getFirestore().collection('users');
    const snapshot = await usersRef.limit(100).get();
    
    const userIds = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      userId: doc.id
    }));

    return userIds.length > 0 ? userIds : [{ userId: 'default' }];
  } catch (error) {
    console.error('정적 경로 생성 중 오류:', error);
    return [{ userId: 'default' }];
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <ProfileView userId={params.userId} />;
} 