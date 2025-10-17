import CatalogClient from "./CatalogClient";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySeason, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllColors 
} from "@/lib/sql";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
}

interface CatalogServerProps {
  category?: string | null;
  season?: string | null;
  subcategory?: string | null;
}

async function getProducts(params: CatalogServerProps): Promise<Product[]> {
  const { category, season, subcategory } = params;
  
  try {
    if (subcategory) {
      return await sqlGetProductsBySubcategoryName(subcategory);
    } else if (category) {
      return await sqlGetProductsByCategory(category);
    } else if (season) {
      return await sqlGetProductsBySeason(season);
    }
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getColors(): Promise<string[]> {
  try {
    const data = await sqlGetAllColors();
    return data.map((item: { color: string }) => item.color);
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
}

export default async function CatalogServer(props: CatalogServerProps) {
  // Parallel data fetching for better performance
  const [products, colors] = await Promise.all([
    getProducts(props),
    getColors(),
  ]);

  return <CatalogClient initialProducts={products} colors={colors} />;
}

