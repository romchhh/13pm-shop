"use client";

import HomeProductCarousel from "./HomeProductCarousel";

export default function Bestsellers() {
  return (
    <HomeProductCarousel
      title="Хіти продажів"
      catalogHref="/catalog?hits=1"
      topSale
    />
  );
}
