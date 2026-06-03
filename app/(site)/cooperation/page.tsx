import type { Metadata } from "next";
import Link from "next/link";
import CooperationContactBlock from "@/components/cooperation/CooperationContactBlock";
import { siteContact } from "@/lib/siteContact";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";
import { textPageMaxWidthClass } from "@/lib/textPageLayout";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.cooperation.title,
  description: seoCopy.cooperation.description,
  path: "/cooperation",
  imageAlt: seoCopy.cooperation.imageAlt,
});

const directions = [
  {
    title: "Гуртові закупівлі",
    description:
      "Тактичний, функціональний та повсякденний одяг з каталогу бренду — для магазинів, підрозділів та корпоративних клієнтів.",
  },
  {
    title: "Пошиття за нашими лекалами",
    description:
      "Виготовлення моделей з лінійок ALPHA, BRAVO, DELTA та інших колекцій 13pm tactic під ваш тираж і брендування.",
  },
  {
    title: "Виробництво за вашими лекалами",
    description:
      "Пошив за кресленнями замовника: прорахунок індивідуально — залежить від моделі, складності та обсягу партії.",
  },
] as const;

export default function CooperationPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] px-3 sm:px-6 pb-20 pt-6 sm:pt-8">
      <div className={textPageMaxWidthClass}>
        <div className="mb-16">
          <Link
            href="/"
            className="inline-block mb-8 text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            ← На головну
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Співпраця</h1>
          <p className="text-lg opacity-80 mt-4 max-w-3xl">
            Оптова закупівля, пошиття та виробництво тактичного й повсякденного одягу. Дропшипінг та
            інші формати — за окремою домовленістю.
          </p>
          <div className="w-20 h-1 bg-black mt-6" />
        </div>

        <div className="mb-12 rounded-xl border border-black/10 bg-black/[0.03] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-2">
            Менеджер з опту та співпраці
          </p>
          <a
            href={`tel:${siteContact.phoneTel}`}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1C1C] hover:opacity-80 transition-opacity"
          >
            {siteContact.phoneDisplay}
          </a>
        </div>

        <div className="space-y-14 text-base leading-relaxed mb-16">
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Оптова закупівля</h2>
            <p className="opacity-90">Працюємо по кількох напрямках співпраці з {SITE_STORE_NAME}:</p>
            <ul className="space-y-3 opacity-90 list-disc pl-5 marker:text-black">
              <li>Гуртові закупівлі одягу (тактичний / функціональний / повсякденний)</li>
              <li>Пошиття за нашими лекалами</li>
              <li>Виробництво за вашими лекалами</li>
            </ul>
            <p className="opacity-90">
              Працюємо як із тактичним і функціональним одягом, так і з повсякденним.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Напрямки</h2>
            <div className="grid gap-4 sm:gap-5">
              {directions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-black/10 p-5 sm:p-6 bg-black/[0.02]"
                >
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="opacity-90">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Умови</h2>
            <div className="space-y-4 rounded-lg border border-black/10 p-5 sm:p-6 bg-black/[0.02]">
              <p className="opacity-90">
                <strong>Гуртові умови на замовлення</strong> передбачають мінімальне замовлення від{" "}
                <strong>5 одиниць</strong> та знижку до <strong>30%</strong> від роздрібної ціни
                (залежить від позиції та обсягу).
              </p>
              <p className="opacity-90">
                <strong>Пошиття за вашими лекалами</strong> — прорахунок індивідуально, залежно від
                моделі, складності та тиражу.
              </p>
            </div>
            <p className="opacity-80 text-sm">
              Точні ціни, терміни та умови оплати узгоджуємо після заявки — зателефонуйте, напишіть у
              месенджері або заповніть форму нижче.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Дропшипінг</h2>
            <p className="opacity-90">
              Для партнерів, які продають без складу: обговорюємо формат відвантаження, брендування
              та логістику індивідуально. Звʼяжіться за номером вище — підберемо зручну схему
              співпраці.
            </p>
          </section>

          <p className="opacity-80 text-sm pt-4 border-t border-black/10">
            Роздрібні замовлення оформлюйте через{" "}
            <Link href="/catalog" className="text-[#1C1C1C] underline font-medium hover:opacity-80">
              каталог
            </Link>
            .
          </p>
        </div>

        <CooperationContactBlock />
      </div>
    </div>
  );
}
