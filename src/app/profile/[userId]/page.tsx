import { ProfileView } from '@/components/ProfileView';

type Props = {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function UserProfilePage({ params }: Props) {
  return <ProfileView userId={params.userId} />;
} 