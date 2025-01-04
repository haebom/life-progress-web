import { ProfileView } from '@/components/ProfileView';

export default function UserProfilePage({
  params,
}: {
  params: {
    userId: string;
  };
}) {
  return <ProfileView userId={params.userId} />;
} 