import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroServer from "@/components/main-page/HeroServer";
import { siteDefaultOgImageAlt, siteMetaDescription, siteRootSeoTitle } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";
import AboutUsSection from "@/components/main-page/AboutUsSection";
import CategoriesShowcase from "@/components/main-page/CategoriesShowcase";
import HomeHashScroll from "@/components/shared/HomeHashScroll";

const Bestsellers = dynamic(() => import("@/components/main-page/Bestsellers"), {
  loading: () => <div className="h-64 animate-pulse bg-white" />,
});
const NewArrivals = dynamic(() => import("@/components/main-page/NewArrivals"), {
  loading: () => <div className="h-64 animate-pulse bg-white" />,
});
import Reviews from "@/components/main-page/Reviews";
import FAQ from "@/components/main-page/FAQ";

export const revalidate = 300;
export const runtime = "nodejs";

export const metadata = buildPageMetadata({
  title: siteRootSeoTitle,
  description: siteMetaDescription,
  path: "/",
  imageAlt: siteDefaultOgImageAlt,
});

export default function Home() {
  return (
    <>
      <HomeHashScroll />
      <HeroServer />

      <Suspense
        fallback={
          <section className="w-full bg-white py-6 lg:py-8">
            <div className="max-w-[1920px] mx-auto px-6">
              <p className="text-[#1C1C1C] font-['Montserrat']">Завантаження категорій...</p>
            </div>
          </section>
        }
      >
        <CategoriesShowcase />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
        <Bestsellers />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
        <NewArrivals />
      </Suspense>

      <AboutUsSection />

      <Reviews />

      <FAQ />
    </>
  );
}
