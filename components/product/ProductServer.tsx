import ProductClient from "./ProductClient";
import ProductClientWrapper from "./ProductClientWrapper";
import { notFound } from "next/navigation";
import { sqlGetProduct } from "@/lib/sql";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  discount_percentage?: number;
  description?: string;
  media?: { url: string; type: string }[];
  sizes?: { size: string; stock: string }[];
  colors?: { label: string; hex?: string | null }[];
  fabric_composition?: string;
  has_lining?: boolean;
  lining_description?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const products = await sqlGetProduct(Number(id));
    return products[0] || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

interface ProductServerProps {
  id: string;
}

export default async function ProductServer({ id }: ProductServerProps) {
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Wrap ProductClient to ensure it only renders client-side after hydration
  return <ProductClientWrapper product={product} />;
}
