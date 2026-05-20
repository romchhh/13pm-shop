import { getActiveHeroSlides } from "@/lib/heroSlides";
import Hero from "./Hero";

export default async function HeroServer() {
  const slides = await getActiveHeroSlides();
  return <Hero slides={slides} />;
}
