"use client";

import HomeProductCarousel from "./HomeProductCarousel";

export default function Bestsellers() {
  return (
    <HomeProductCarousel
      title="BESTSELLERS"
      catalogHref="/catalog?hits=1"
      topSale
    />
  );
}
