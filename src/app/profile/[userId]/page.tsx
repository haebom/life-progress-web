import { ProfileView } from '@/components/ProfileView';

interface PageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage({ params }: PageProps) {
  return <ProfileView userId={params.userId} />;
} 