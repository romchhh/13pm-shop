import ProductClientWrapper from "./ProductClientWrapper";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import type { Product } from "@/lib/types/product";
import { categoryCanonicalPath, getSiteBaseUrl, productCanonicalPath } from "@/lib/seo";

interface ProductServerProps {
  product: Product;
}

export default async function ProductServer({ product }: ProductServerProps) {

  const baseUrl = getSiteBaseUrl();
  const productSlug = product.slug || String(product.id);
  const breadcrumbs = [
    { name: "Головна", url: baseUrl },
    { name: "Каталог товарів", url: `${baseUrl}/catalog` },
    ...(product.category_name
      ? [
          {
            name: product.category_name,
            url: `${baseUrl}${categoryCanonicalPath(
              product.category_slug ?? null,
              product.category_name
            )}`,
          },
        ]
      : []),
    { name: product.name, url: `${baseUrl}${productCanonicalPath(product.slug, product.id)}` },
  ];

  const productForStructuredData = {
    id: product.id,
    name: product.name,
    article: product.article,
    description: product.description,
    price: product.price,
    discount_percentage: product.discount_percentage,
    in_stock: (product as any).in_stock ?? null,
    stock: (product as any).stock ?? null,
    first_media: product.media?.length ? product.media[0] : null,
    category_name: product.category_name,
  };

  return (
    <>
      <ProductStructuredData product={productForStructuredData} baseUrl={baseUrl} slug={productSlug} />
      <BreadcrumbStructuredData items={breadcrumbs} />
      {/* key змушує клієнтську обгортку перемонтовуватись при переході на інший товар,
          щоб скрол завжди повертався на початок сторінки */}
      <ProductClientWrapper key={product.id} product={product} />
    </>
  );
}
