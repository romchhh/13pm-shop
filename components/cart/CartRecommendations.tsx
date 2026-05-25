"use client";

import { useMemo, useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import { useProducts } from "@/lib/useProducts";
import CatalogProductCard, {
  type CatalogProductCardItem,
} from "@/components/catalog/CatalogProductCard";
import HomeSectionCarousel, { homeCarouselItemClass } from "@/components/main-page/HomeSectionCarousel";
import { mapToCatalogProductCardItem } from "@/lib/mapToCatalogProductCardItem";
import { addProductCardToCart } from "@/lib/productCardAddToCart";

export default function CartRecommendations() {
  const { products, loading } = useProducts();
  const { items, addItem } = useBasket();
  const [cartError, setCartError] = useState<string | null>(null);

  const cartIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => !cartIds.has(p.id))
      .slice(0, 8)
      .map((p) => mapToCatalogProductCardItem(p));
  }, [products, cartIds]);

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

  if (loading || filtered.length === 0) {
    return null;
  }

  return (
    <>
      {cartError && (
        <div className="mx-auto -mb-6 max-w-[1920px] px-6 lg:px-10">
          <p className="font-['Montserrat'] text-sm text-red-600">{cartError}</p>
        </div>
      )}
      <HomeSectionCarousel title="Вам також може сподобатися" catalogHref="/catalog">
        {filtered.map((product, index) => (
          <div key={product.id} className={`${homeCarouselItemClass} flex self-stretch`}>
            <CatalogProductCard
              product={product}
              showSubtitle={false}
              onAddToCart={handleAddToCart}
              imagePriority={index < 2}
              imageLoading={index < 4 ? "eager" : "lazy"}
              className="h-full w-full min-h-full"
            />
          </div>
        ))}
      </HomeSectionCarousel>
    </>
  );
}
