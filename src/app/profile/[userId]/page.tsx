import { ProfileView } from '@/components/ProfileView';

interface PageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: PageProps) {
  return <ProfileView userId={params.userId} />;
} 