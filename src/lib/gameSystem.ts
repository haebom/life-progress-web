'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Achievement, GameStats, Quest } from '@/types';
import { collection, query, where, getDocs } from 'firebase/firestore';

// 각 레벨에 필요한 경험치
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2500,   // Level 3
  5000,   // Level 4
  10000,  // Level 5
  20000,  // Level 6
  35000,  // Level 7
  55000,  // Level 8
  80000,  // Level 9
  110000, // Level 10
];

export async function updateGameStats(
  userId: string,
  userData: User,
  updates: Partial<GameStats>
): Promise<void> {
  try {
    const currentStats = userData.gameStats || {
      level: 1,
      experience: 0,
      questsCompleted: 0,
      points: 0,
      streak: 0,
      lastActive: null,
      achievements: [],
    };

    const newStats = {
      ...currentStats,
      ...updates,
    };

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      gameStats: newStats,
    });
  } catch (error) {
    console.error('게임 통계 업데이트 중 오류 발생:', error);
    throw error;
  }
}

export async function calculateProgress(
  userId: string,
  userData: User
): Promise<number> {
  const blocks = userData.blocks || {};
  const totalBlocks = Object.keys(blocks).length;
  if (totalBlocks === 0) return 0;

  const gameStats = userData.gameStats || {
    level: 1,
    experience: 0,
    questsCompleted: 0,
    points: 0,
    streak: 0,
    lastActive: null,
    achievements: [],
  };

  const totalProgress = Object.values(blocks).reduce(
    (sum, block) => sum + block.progress,
    0
  );

  const progress = Math.round(totalProgress / totalBlocks);

  // 진행률이 100%에 도달하면 업적 달성
  if (progress === 100) {
    const achievement: Achievement = {
      id: `progress_100_${Date.now()}`,
      title: '완벽한 달성',
      description: '모든 목표를 100% 달성했습니다!',
      icon: '🏆',
      requirement: {
        type: 'goals_completed',
        value: totalBlocks,
      },
      reward: {
        points: 1000,
        experience: 500,
      },
    };

    await updateGameStats(userId, userData, {
      ...gameStats,
      achievements: [...gameStats.achievements, achievement],
      points: gameStats.points + achievement.reward.points,
      experience: gameStats.experience + achievement.reward.experience,
    });
  }

  return progress;
}

export async function updateStreak(userId: string, userData: User): Promise<void> {
  try {
    const gameStats = userData.gameStats || {
      level: 1,
      experience: 0,
      questsCompleted: 0,
      points: 0,
      streak: 0,
      lastActive: null,
      achievements: [],
    };

    const now = new Date();
    const lastActive = gameStats.lastActive?.toDate() || new Date(0);
    const daysSinceLastActive = Math.floor(
      (now.getTime() - lastActive.getTime()) / (24 * 60 * 60 * 1000)
    );

    let newStreak = gameStats.streak;
    if (daysSinceLastActive === 1) {
      // 연속 접속
      newStreak += 1;
    } else if (daysSinceLastActive > 1) {
      // 연속 접속 끊김
      newStreak = 1;
    }

    // 연속 접속 업적 확인
    if (newStreak >= 7) {
      const achievement: Achievement = {
        id: `streak_7_${Date.now()}`,
        title: '일주일 연속 접속',
        description: '7일 연속으로 접속했습니다!',
        icon: '🔥',
        requirement: {
          type: 'consecutive_days',
          value: 7,
        },
        reward: {
          points: 500,
          experience: 250,
        },
      };

      await updateGameStats(userId, userData, {
        ...gameStats,
        streak: newStreak,
        achievements: [...gameStats.achievements, achievement],
        points: gameStats.points + achievement.reward.points,
        experience: gameStats.experience + achievement.reward.experience,
      });
    } else {
      await updateGameStats(userId, userData, {
        ...gameStats,
        streak: newStreak,
      });
    }
  } catch (error) {
    console.error('연속 접속 업데이트 중 오류 발생:', error);
    throw error;
  }
}

export async function getUserQuests(uid: string): Promise<Quest[]> {
  if (!uid) {
    throw new Error('유저 UID가 없습니다.');
  }

  try {
    const questsRef = collection(db, 'quests');
    const q = query(questsRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Quest));
  } catch (error) {
    console.error('퀘스트 조회 중 오류:', error);
    throw error;
  }
} 