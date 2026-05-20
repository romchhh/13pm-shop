"use client";

import { useMemo, useState } from "react";
import CatalogProductCard, {
  type CatalogProductCardItem,
} from "@/components/catalog/CatalogProductCard";
import HomeSectionCarousel, {
  homeCarouselItemClass,
} from "@/components/main-page/HomeSectionCarousel";
import { useBasket } from "@/lib/BasketProvider";
import { mapToCatalogProductCardItem } from "@/lib/mapToCatalogProductCardItem";
import { addProductCardToCart } from "@/lib/productCardAddToCart";
import { useProducts } from "@/lib/useProducts";

export type YouMightLikeProduct = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  first_media?: { url: string; type: string } | null;
  description?: string | null;
  subtitle?: string | null;
  old_price?: number | null;
  discount_percentage?: number | null;
  is_new?: boolean;
  is_hit?: boolean;
  is_promo?: boolean;
  gift_product_id?: number | null;
  in_stock?: boolean;
  stock?: number;
};

interface YouMightLikeProps {
  suggestedProducts?: YouMightLikeProduct[];
  title?: string;
  /** Показати посилання «Весь каталог →» */
  showCatalogLink?: boolean;
}

export default function YouMightLike({
  suggestedProducts,
  title,
  showCatalogLink = false,
}: YouMightLikeProps = {}) {
  const { products: clientProducts, loading } = useProducts();
  const { addItem } = useBasket();
  const [cartError, setCartError] = useState<string | null>(null);

  const productsById = useMemo(() => {
    const map = new Map<number, (typeof clientProducts)[number]>();
    for (const p of clientProducts) {
      map.set(p.id, p);
    }
    return map;
  }, [clientProducts]);

  const items = useMemo((): CatalogProductCardItem[] => {
    const source = suggestedProducts?.length
      ? suggestedProducts.slice(0, 8)
      : [...clientProducts].sort(() => 0.5 - Math.random()).slice(0, 8);

    return source.map((p) => {
      const full = productsById.get(p.id);
      return mapToCatalogProductCardItem(full ?? p, p);
    });
  }, [suggestedProducts, clientProducts, productsById]);

  const handleAddToCart = async (
    e: React.MouseEvent,
    product: CatalogProductCardItem
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCartError(null);
    const result = await addProductCardToCart(addItem, product);
    if (!result.ok) {
      setCartError(result.message);
      setTimeout(() => setCartError(null), 5000);
    }
  };

  const isLoading = !suggestedProducts?.length && loading;

  if (isLoading) {
    return (
      <HomeSectionCarousel
        title={title || "Вам також може сподобатися"}
        catalogHref={showCatalogLink ? "/catalog" : null}
        loading
      />
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <>
      {cartError && (
        <div className="mx-auto -mb-6 max-w-[1920px] px-6 lg:px-10">
          <p className="font-['Montserrat'] text-sm text-red-600">{cartError}</p>
        </div>
      )}
      <HomeSectionCarousel
        title={title || "Вам також може сподобатися"}
        catalogHref={showCatalogLink ? "/catalog" : null}
      >
        {items.map((product, index) => (
          <div key={product.id} className={homeCarouselItemClass}>
            <CatalogProductCard
              product={product}
              showSubtitle
              onAddToCart={handleAddToCart}
              imagePriority={index < 2}
              imageLoading={index < 4 ? "eager" : "lazy"}
              className="h-full"
            />
          </div>
        ))}
      </HomeSectionCarousel>
    </>
  );
}
