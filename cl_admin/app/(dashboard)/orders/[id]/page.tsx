'use client';

import { use } from 'react';
import OrderDetailPage from '@/components/pages/OrderDetailPage/Index';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderDetailPage orderId={Number(id)} />;
}
