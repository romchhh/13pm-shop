import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Договір публічної оферти | CHARS",
  description: "Договір публічної оферти CHARS",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-block mb-6 text-lg hover:underline"
      >
        ← На головну
      </Link>
      <h1 className="text-4xl font-bold mb-8 text-center">
        Договір публічної оферти
      </h1>

      <div className="space-y-6 text-base leading-relaxed">
        <section>
          <p className="mb-4">
            Прочитайте текст цього Договору публічної оферти, надалі – &quot;Договір&quot;,
            і якщо Ви не згодні з яким-небудь його пунктом, чи не зрозуміли будь-який пункт
            Договору, пропонуємо Вам відмовитися від купівлі товару.
          </p>
          <p className="mb-4">
            У випадку прийняття умов Договору, Ви погоджуєтеся з усіма його умовами і
            підтверджуєте, що Вам зрозумілі всі його положення.
          </p>
          <p className="mb-4">
            Ця угода носить характер публічної оферти, є еквівалентом &quot;усної угоди&quot;
            і відповідно до чинного законодавства України має належну юридичну силу.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Визначення термінів
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Сайт</strong> – веб-сайт, що розміщений в мережі Інтернет за адресою:
              https://chars.com, включаючи всі його веб-сторінки.
            </li>
            <li>
              <strong>Товар</strong> – товари, зображення та/або опис яких розміщено на Сайті.
            </li>
            <li>
              <strong>Публічна оферта</strong> - спрямована невизначеному колу осіб публічна
              пропозиція Продавця, що стосується укладення договору купівлі-продажу Товарів.
            </li>
            <li>
              <strong>Користувач/Покупець</strong> – особа, що переглядає інформацію на Сайті
              та/або замовляє, та/або отримує Товари.
            </li>
            <li>
              <strong>Замовлення</strong> – належним чином оформлений та розміщений запит
              Користувача на здійснення купівлі обраних ним Товарів.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            1. Загальні положення
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Цей Договір є договором публічної оферти, його умови однакові для всіх
              Користувачів/Покупців незалежно від статусу.
            </li>
            <li>
              У разі прийняття умов цього Договору, тобто Публічної оферти Продавця, Користувач
              стає Покупцем.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Предмет договору</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Продавець зобов&apos;язується передати у власність Покупцеві Товар, а Покупець
              зобов&apos;язується оплатити та прийняти Товар на умовах цього Договору.
            </li>
            <li>Договір поширюється на всі види Товарів і послуг, що представлені на Сайті.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Порядок оформлення Замовлення</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Представлені фото-зразки містять один або більше видів Товару певного артикулу та
              текстову інформацію про артикул, доступні розміри, ціну.
            </li>
            <li>
              Відомості, розміщені на сайті мають виключно інформативний характер.
            </li>
            <li>
              Користувач/Покупець має самостійно оформити Замовлення на будь-який Товар, який
              є доступним для замовлення на Сайті.
            </li>
            <li>
              У разі відсутності замовленого Товару, Продавець має право виключити зазначений
              Товар із Замовлення.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Ціна і порядок оплати</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Ціна кожного окремого Товару визначається Продавцем і вказується на Сайті.
            </li>
            <li>
              Ціна Договору дорівнює ціні Замовлення. Сума Замовлення може змінюватися в
              залежності від ціни, кількості або номенклатури Товару.
            </li>
            <li>
              Покупець здійснює оплату Товару згідно Замовлення. Покупець самостійно вибирає
              один з таких способів оплати: готівковий розрахунок або безготівковий розрахунок.
            </li>
            <li>Оплата Товару здійснюється виключно у гривні.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Доставка Товару</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Доставка виконується силами Продавця або службами доставки по території України
              за рахунок Покупця.
            </li>
            <li>
              Загальний термін доставки Товару складається з терміну обробки Замовлення і строку
              доставки. Термін обробки Замовлення – від одного робочого дня до трьох.
            </li>
            <li>
              При отриманні Товару Одержувач зобов&apos;язаний перевірити Товар за кількістю,
              якістю, асортиментом та комплектністю.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Повернення Товару</h2>
          <p className="mb-2">
            Повернення Товару належної якості здійснюється відповідно до Закону України
            «Про захист прав споживачів».
          </p>
          <p className="mb-2">
            Покупець має право відмовитися від поставленого Товару належної якості протягом
            14 (чотирнадцяти) днів з моменту отримання Товару виключно за умови, що збережено
            товарний вид, споживчі властивості Товару, фабричну упаковку, ярлики та розрахунковий
            документ.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Права та обов&apos;язки Продавця</h2>
          <p className="mb-2">Продавець має право:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              В односторонньому порядку призупинити продаж Товарів у випадку порушення
              Користувачем/Покупцем умов
            </li>
            <li>На власний розсуд змінювати ціну на Товари</li>
            <li>
              У разі відсутності замовлених Товарів, виключити зазначений Товар із Замовлення
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Права та обов&apos;язки Покупця</h2>
          <p className="mb-2">Користувач/Покупець має право:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Обрати Товари, оформлювати та направляти Замовлення</li>
            <li>Вимагати від Продавця виконання умов та обов&apos;язків</li>
          </ul>
          <p className="mb-2 mt-4">Користувач/Покупець зобов&apos;язується:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Належним чином оплатити та отримати оформлене Замовлення
            </li>
            <li>
              Надати Продавцю повну інформацію, що необхідна для здійснення доставки Замовлення
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Термін дії Договору</h2>
          <p>
            Цей Договір набирає чинності з дня оформлення Замовлення або реєстрації
            Користувача/Покупця на Сайті і діє до виконання всіх умов Договору.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Реквізити</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Отримувач</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">ФОП Романець Микола Миколайович</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ІПН/ЄДРПОУ</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">3357714797</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">IBAN</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">UA353220010000026007320071773</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Акціонерне товариство</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">УНІВЕРСАЛ БАНК</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">МФО</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">322001</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ЄДРПОУ Банку</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">21133352</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">
            Дата останнього оновлення: 27 жовтня 2025 року
          </p>
        </section>
      </div>
    </div>
  );
}

