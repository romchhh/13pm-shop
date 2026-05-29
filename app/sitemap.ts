import { MetadataRoute } from "next";
import { sqlGetAllProducts, sqlGetAllCategories } from "@/lib/sql";
import { categoryCanonicalPath, getSiteBaseUrl, productCanonicalPath } from "@/lib/seo";

type CategoryItem = { id: number; name: string; slug?: string | null };
type ProductItem = { id: number; name: string; slug?: string | null };

async function getProducts(): Promise<ProductItem[]> {
  try {
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

async function getCategories(): Promise<CategoryItem[]> {
  try {
    return await sqlGetAllCategories();
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/delivery-and-payment`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns-and-exchange`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}${categoryCanonicalPath(category.slug, category.name)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const productPages = products
    .filter((p) => p.slug?.trim() || p.id)
    .map((product) => ({
      url: `${baseUrl}${productCanonicalPath(product.slug, product.id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}
