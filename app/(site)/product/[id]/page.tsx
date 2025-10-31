import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 600; // ISR every 10 minutes

// Generate static params for popular products
export async function generateStaticParams() {
  try {
    const { sqlGetAllProducts } = await import("@/lib/sql");
    const products = await sqlGetAllProducts();
    
    // Generate static pages for all products (or limit to top N)
    return products.slice(0, 50).map((product: { id: number }) => ({
      id: String(product.id),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return (
    <main>
      <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження товару...</div>}>
        <ProductServer id={id} />
      </Suspense>
      <YouMightLike />
    </main>
  );
}
