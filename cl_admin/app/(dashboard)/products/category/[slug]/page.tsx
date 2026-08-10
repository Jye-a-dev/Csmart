import CategoryProductsPage from '@/components/pages/CategoryProductsPage/Index';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = 'then' in params ? await params : params;
  return <CategoryProductsPage categorySlug={resolvedParams.slug} />;
}
