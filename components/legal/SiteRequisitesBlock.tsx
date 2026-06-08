import { siteRequisites } from "@/lib/siteLegal";

export default function SiteRequisitesBlock() {
  return (
    <div className="bg-black/5 p-8 rounded-2xl border border-black/10 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold mb-2 opacity-60">Отримувач</p>
          <p className="text-sm opacity-90">{siteRequisites.recipient}</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 opacity-60">ІПН/ЄДРПОУ</p>
          <p className="text-sm opacity-90">{siteRequisites.taxId}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold mb-2 opacity-60">IBAN</p>
          <p className="text-sm opacity-90 break-all">{siteRequisites.iban}</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 opacity-60">Банк</p>
          <p className="text-sm opacity-90">{siteRequisites.bankName}</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 opacity-60">МФО</p>
          <p className="text-sm opacity-90">{siteRequisites.mfo}</p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2 opacity-60">ЄДРПОУ Банку</p>
          <p className="text-sm opacity-90">{siteRequisites.bankEdrpou}</p>
        </div>
      </div>
    </div>
  );
}
