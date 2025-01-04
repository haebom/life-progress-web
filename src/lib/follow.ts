import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { User } from '@/types';

export async function followUser(currentUserId: string, targetUserId: string): Promise<void> {
  try {
    const targetUserRef = doc(db, 'users', targetUserId);
    const targetUserSnap = await getDoc(targetUserRef);

    if (!targetUserSnap.exists()) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const targetUserData = targetUserSnap.data();
    if (targetUserData.isPublic === false) {
      throw new Error('비공개 프로필입니다.');
    }

    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef2 = doc(db, 'users', targetUserId);

    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId),
    });

    await updateDoc(targetUserRef2, {
      followers: arrayUnion(currentUserId),
    });
  } catch (error) {
    console.error('팔로우 중 오류 발생:', error);
    throw error;
  }
}

export async function unfollowUser(currentUserId: string, targetUserId: string): Promise<void> {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);

    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId),
    });

    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId),
    });
  } catch (error) {
    console.error('언팔로우 중 오류 발생:', error);
    throw error;
  }
}

export async function getFollowers(userId: string): Promise<Partial<User>[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const userData = userSnap.data();
    const followers = userData.followers || [];

    const followerData = await Promise.all(
      followers.map(async (followerId: string) => {
        const followerRef = doc(db, 'users', followerId);
        const followerSnap = await getDoc(followerRef);

        if (followerSnap.exists()) {
          const data = followerSnap.data();
          return {
            id: followerSnap.id,
            name: data.name,
            email: data.email,
            photoURL: data.photoURL,
          };
        }
        return null;
      })
    );

    return followerData.filter((data): data is Partial<User> => data !== null);
  } catch (error) {
    console.error('팔로워 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export async function getFollowing(userId: string): Promise<Partial<User>[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const userData = userSnap.data();
    const following = userData.following || [];

    const followingData = await Promise.all(
      following.map(async (followingId: string) => {
        const followingRef = doc(db, 'users', followingId);
        const followingSnap = await getDoc(followingRef);

        if (followingSnap.exists()) {
          const data = followingSnap.data();
          return {
            id: followingSnap.id,
            name: data.name,
            email: data.email,
            photoURL: data.photoURL,
          };
        }
        return null;
      })
    );

    return followingData.filter((data): data is Partial<User> => data !== null);
  } catch (error) {
    console.error('팔로잉 목록을 가져오는 중 오류 발생:', error);
    throw error;
  }
}

export async function checkFollowStatus(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    if (!currentUserDoc.exists()) {
      return false;
    }

    const userData = currentUserDoc.data() as User;
    return userData.following?.includes(targetUserId) || false;
  } catch (error) {
    console.error('팔로우 상태 확인 중 오류 발생:', error);
    return false;
  }
} 