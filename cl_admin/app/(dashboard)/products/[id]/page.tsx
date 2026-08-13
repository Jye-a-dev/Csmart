'use client';

import { use } from 'react';
import ProductFormPage from '@/components/pages/ProductFormPage/Index';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductFormPage mode="edit" productId={id} />;
}
