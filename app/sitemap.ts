import { MetadataRoute } from "next";
import { sqlGetAllProducts, sqlGetAllCategories } from "@/lib/sql";
import { categoryCanonicalPath, getSiteBaseUrl, productCanonicalPath } from "@/lib/seo";

type CategoryItem = { id: number; name: string; slug?: string | null }
type ProductItem = { id: number; name: string; slug?: string | null }

async function getProducts(): Promise<ProductItem[]> {
  try {
    const products = await sqlGetAllProducts();
    return products;
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

async function getCategories(): Promise<CategoryItem[]> {
  try {
    const categories = await sqlGetAllCategories();
    return categories;
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/final`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/delivery-and-payment`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns-and-exchange`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Category pages (ЧПУ)
  const categoryPages = categories.map((category: CategoryItem) => ({
    url: `${baseUrl}${categoryCanonicalPath(category.slug, category.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Product pages (ЧПУ)
  const productPages = products
    .filter((p) => p.slug?.trim() || p.id)
    .map((product: ProductItem) => ({
    url: `${baseUrl}${productCanonicalPath(product.slug, product.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
