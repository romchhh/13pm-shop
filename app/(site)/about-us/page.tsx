import type { Metadata } from "next";
import AboutUsSection from "@/components/main-page/AboutUsSection";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.about.title,
  description: seoCopy.about.description,
  path: "/about-us",
  imageAlt: seoCopy.about.imageAlt,
});

export default function AboutUsPage() {
  return (
    <div className="w-full bg-white">
      <AboutUsSection showBackLink />
    </div>
  );
}
