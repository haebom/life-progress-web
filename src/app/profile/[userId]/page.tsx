import { Metadata } from 'next';
import { ProfileView } from '@/components/ProfileView';

type PageParams = { userId: string };

export async function generateMetadata({ 
  params 
}: { 
  params: PageParams 
}): Promise<Metadata> {
  return {
    title: `User Profile - ${params.userId}`,
  };
}

export default async function Page({ 
  params 
}: { 
  params: PageParams 
}) {
  return <ProfileView userId={params.userId} />;
} 