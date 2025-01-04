import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateRemainingLife(birthDate: string, lifeExpectancy: number) {
  const birthDateTime = new Date(birthDate);
  const now = new Date();
  
  if (isNaN(birthDateTime.getTime())) {
    console.error('Invalid birth date:', birthDate);
    return {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
    };
  }

  const endDate = new Date(birthDateTime);
  endDate.setFullYear(birthDateTime.getFullYear() + lifeExpectancy);

  const totalDays = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const weeks = Math.floor(((totalDays % 365) % 30) / 7);
  const days = ((totalDays % 365) % 30) % 7;

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    weeks: Math.max(0, weeks),
    days: Math.max(0, days),
  };
}

export function calculateProgress(birthDate: Date, lifeExpectancy: number): number {
  const today = new Date();
  const totalDays = lifeExpectancy * 365;
  const daysSinceBirth = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progress = (daysSinceBirth / totalDays) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function formatProgress(progress: number): string {
  return `${progress.toFixed(2)}% 진행됨`;
}

export function calculateTimeBlocks(birthDate: Timestamp | null, lifeExpectancy: number) {
  if (!birthDate) {
    return {
      total: 0,
      elapsed: 0,
      remaining: 0,
    };
  }

  const today = new Date();
  const birthDateTime = birthDate.toDate();
  const totalWeeks = lifeExpectancy * 52;
  const weeksSinceBirth = Math.floor(
    (today.getTime() - birthDateTime.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  return {
    total: totalWeeks,
    elapsed: weeksSinceBirth,
    remaining: totalWeeks - weeksSinceBirth,
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
} 