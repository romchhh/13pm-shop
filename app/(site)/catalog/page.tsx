import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export const revalidate = 300; // ISR every 5 minutes

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    
    return (
        <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження каталогу...</div>}>
            <CatalogServer 
                category={params.category || null}
                season={params.season || null}
                subcategory={params.subcategory || null}
            />
        </Suspense>
    );
}