import { Metadata } from 'next';
import { ProfileView } from '@/components/ProfileView';

type PageProps = {
  params: {
    userId: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `User Profile - ${params.userId}`,
  };
}

export default function Page({ params }: PageProps) {
  return <ProfileView userId={params.userId} />;
} 