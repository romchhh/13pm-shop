import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import HeroSlidesSection from "@/components/admin/HeroSlidesSection";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Hero-банери | Plywood Present Admin",
  description: "Управління слайдами головного банера (десктоп і мобільна версія)",
};

export default function HeroAdminPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Hero-банери" />
      <HeroSlidesSection />
    </div>
  );
}
