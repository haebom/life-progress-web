'use client';

import ProfileView from '@/components/ProfileView';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <ProfileView userId={params.userId} />;
} 