import UserProductDetailPage from '@/components/pages/UserProductDetailPage/UserProductDetailPage';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  return <UserProductDetailPage productId={id} />;
}

