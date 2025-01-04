'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { InitialSetupModal } from '@/components/InitialSetupModal';

export default function SignupPage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && !user.birthDate) {
      setIsModalOpen(true);
    }
  }, [user]);

  const handleSetupComplete = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <InitialSetupModal
        user={user}
        setUser={setUser}
        isOpen={isModalOpen}
        onClose={handleSetupComplete}
      />
    </div>
  );
} 