import ProfileView from '@/components/ProfileView';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export function generateStaticParams() {
  // 정적으로 생성할 프로필 페이지의 userId 목록
  return [
    { userId: 'default' },
    { userId: 'guest' },
    { userId: 'demo' }
  ];
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <ProfileView userId={params.userId} />;
} 