"use client";

import { useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import { useProducts } from "@/lib/useProducts";
import CatalogProductCard, {
  type CatalogProductCardItem,
} from "@/components/catalog/CatalogProductCard";
import { mapToCatalogProductCardItem } from "@/lib/mapToCatalogProductCardItem";
import { addProductCardToCart } from "@/lib/productCardAddToCart";
import HomeSectionCarousel, { homeCarouselItemClass } from "./HomeSectionCarousel";

interface HomeProductCarouselProps {
  title: string;
  catalogHref: string;
  topSale?: boolean;
  limitedEdition?: boolean;
}

export default function HomeProductCarousel({
  title,
  catalogHref,
  topSale,
  limitedEdition,
}: HomeProductCarouselProps) {
  const { products, loading } = useProducts({ topSale, limitedEdition });
  const { addItem } = useBasket();
  const [cartError, setCartError] = useState<string | null>(null);

  const items = products.slice(0, 8).map((p) => mapToCatalogProductCardItem(p));

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

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <>
      {cartError && (
        <div className="mx-auto -mb-6 max-w-[1920px] px-6 lg:px-10">
          <p className="font-['Montserrat'] text-sm text-red-600">{cartError}</p>
        </div>
      )}
      <HomeSectionCarousel title={title} catalogHref={catalogHref} loading={loading}>
        {items.map((product, index) => (
          <div key={product.id} className={`${homeCarouselItemClass} flex self-stretch`}>
            <CatalogProductCard
              product={product}
              showSubtitle
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
