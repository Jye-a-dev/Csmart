'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedProductsAndCategoriesPage from '@/app/(dashboard)/products/page';

export default function CategoriesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products?tab=categories');
  }, [router]);

  return <UnifiedProductsAndCategoriesPage />;
}
