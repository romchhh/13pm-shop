import type { Metadata } from "next";
import FinalCard from "@/components/final-card/FinalCard";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.checkout.title,
  description: seoCopy.checkout.description,
  path: "/final",
  noIndex: true,
});

export default function Page() {
  return <FinalCard />;
}
