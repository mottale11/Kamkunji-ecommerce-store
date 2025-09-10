// app/products/[id]/page.tsx - SERVER COMPONENT

import { Suspense } from 'react';
import ProductPageContent from './ProductPageContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    }>
      <ProductPageContent id={id} />
    </Suspense>
  );
}