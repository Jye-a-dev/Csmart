'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainPage from '@/components/pages/MainPage/MainPage';

export default function PublicPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
      router.replace('/user');
    }
  }, [router]);

  return <MainPage />;
}
