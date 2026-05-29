import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.contacts.title,
  description: seoCopy.contacts.description,
  path: "/contacts",
  imageAlt: seoCopy.contacts.imageAlt,
});

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
