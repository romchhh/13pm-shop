import TopSaleClient from "./TopSaleClient";
import { sqlGetTopSaleProducts } from "@/lib/sql";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
}

async function getTopSaleProducts(): Promise<Product[]> {
  try {
    return await sqlGetTopSaleProducts();
  } catch (error) {
    console.error("Error fetching top sale products:", error);
    return [];
  }
}

export default async function TopSaleServer() {
  const products = await getTopSaleProducts();
  
  return <TopSaleClient products={products} />;
}

