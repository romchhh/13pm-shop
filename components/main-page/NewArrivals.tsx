"use client";

import HomeProductCarousel from "./HomeProductCarousel";

export default function NewArrivals() {
  return (
    <HomeProductCarousel
      title="Новинки"
      catalogHref="/catalog?new=1"
      limitedEdition
    />
  );
}
