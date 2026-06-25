"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import Select from "@/components/admin/form/Select";
import { getPaymentTypeLabel } from "@/lib/paymentTypeLabels";
import { summarizeOrderAmounts } from "@/lib/orderAmounts";

type OrderItemRow = {
  id: number;
  product_name: string;
  color?: string | null;
  size: string;
  quantity: number;
  price: string | number;
};

type OrderFormData = {
  customer_name: string;
  phone_number: string;
  email: string;
  delivery_method: string;
  city: string;
  post_office: string;
  status: string;
  payment_type: string;
  promo_code: string | null;
  promo_discount_amount: number;
  loyalty_discount_amount: number;
  items: OrderItemRow[];
};

export default function EditOrderPage() {
  const params = useParams();
  const orderId = params?.id;
  const router = useRouter();

  const options = [
    { value: "pending", label: "Очікується" },
    { value: "delivering", label: "Доставляємо" },
    { value: "complete", label: "Завершено" },
  ];

  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: "",
    phone_number: "",
    email: "",
    delivery_method: "",
    city: "",
    post_office: "",
    status: "",
    payment_type: "",
    promo_code: null,
    promo_discount_amount: 0,
    loyalty_discount_amount: 0,
    items: [],
  });

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        setFormData({
          customer_name: data.customer_name || "",
          phone_number: data.phone_number || "",
          email: data.email || "",
          delivery_method: data.delivery_method || "",
          city: data.city || "",
          post_office: data.post_office || "",
          status: data.status || "",
          payment_type: data.payment_type || "",
          promo_code: data.promo_code ?? null,
          promo_discount_amount: Number(data.promo_discount_amount) || 0,
          loyalty_discount_amount: Number(data.loyalty_discount_amount) || 0,
          items: data.items || [],
        });
      } catch (err) {
        console.error("Failed to fetch order", err);
      }
    }

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    router.push("/admin/orders");
  };

  const orderAmounts = summarizeOrderAmounts({
    items: formData.items.map((item) => ({
      price: Number(item.price),
      quantity: item.quantity,
    })),
    loyaltyDiscountAmount: formData.loyalty_discount_amount,
    promoDiscountAmount: formData.promo_discount_amount,
  });

  const calculateTotal = () => orderAmounts.subtotal;

  const calculatePayableTotal = () => orderAmounts.orderTotal;

  const calculateRemainingPayment = () => {
    const total = calculatePayableTotal();
    if (formData.payment_type === "full" || formData.payment_type === "crypto") {
      return 0;
    } else if (formData.payment_type === "prepay") {
      return total;
    } else if (formData.payment_type === "pay_after") {
      return total; // оплата при отриманні — вся сума ще не сплачена
    } else if (formData.payment_type === "test_payment") {
      return 0; // тест оплата — вважається повністю оплаченим
    } else if (formData.payment_type === "installment") {
      // For installment, calculate remaining after first payment (30% or minimum 300)
      const firstPayment = Math.max(300, Math.round(total * 0.3));
      return Math.max(0, total - firstPayment);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Редагувати Замовлення" />

      {/* Customer Info */}
      <div className="px-4">
        <ComponentCard title="Інформація про замовлення">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ім&#39;я клієнта</Label>
              <Input
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Номер телефону</Label>
              <Input
                type="phone"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Метод доставки</Label>
              <Input
                type="text"
                value={formData.delivery_method}
                onChange={(e) =>
                  handleChange("delivery_method", e.target.value)
                }
                disabled
              />
            </div>
            <div>
              <Label>Місто</Label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Відділення Нової Пошти</Label>
              <Input
                type="text"
                value={formData.post_office}
                onChange={(e) => handleChange("post_office", e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label>Спосіб оплати</Label>
              <Input
                type="text"
                value={getPaymentTypeLabel(formData.payment_type, "long")}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <Label>Промокод</Label>
              <Input
                type="text"
                value={formData.promo_code || "—"}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <Label>Статус</Label>
              <div className="relative">
                <Select
                  options={options}
                  placeholder="Select Option"
                  value={formData.status}
                  onChange={(value: string) => handleChange("status", value)}
                  className="dark:bg-dark-900"
                />
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Order Items Table */}
      <div className="px-4">
        <ComponentCard title="Товари у замовленні">
          {formData.items.length === 0 ? (
            <p className="text-gray-500">Немає товарів у цьому замовленні.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm bg-white">
                <thead className="bg-white text-black">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      Назва продукту
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      Розмір
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      Колір
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      Кількість
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      Ціна (₴)
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      Сума (₴)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {formData.items.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 bg-white"
                      >
                        <td className="px-4 py-3 text-black">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {item.size}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {item.color || "—"}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-black text-right">
                          {Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-black text-right font-semibold">
                          {(Number(item.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white">
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-black">
                      Сума товарів:
                    </td>
                    <td className="px-4 py-3 text-right text-black">
                      {calculateTotal().toFixed(2)} ₴
                    </td>
                  </tr>
                  {orderAmounts.bulkDiscountAmount > 0 && (
                    <tr className="bg-white">
                      <td colSpan={5} className="px-4 py-3 text-right font-semibold text-black">
                        Знижка на замовлення:
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        −{orderAmounts.bulkDiscountAmount.toFixed(2)} ₴
                      </td>
                    </tr>
                  )}
                  {formData.promo_code && orderAmounts.promoDiscountAmount > 0 && (
                    <tr className="bg-white">
                      <td colSpan={5} className="px-4 py-3 text-right font-semibold text-black">
                        Промокод {formData.promo_code}:
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        −{orderAmounts.promoDiscountAmount.toFixed(2)} ₴
                      </td>
                    </tr>
                  )}
                  <tr className="bg-white">
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-black">
                      До сплати:
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      {calculatePayableTotal().toFixed(2)} ₴
                    </td>
                  </tr>
                  {formData.payment_type && (
                    <tr className="bg-white">
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-right font-semibold text-black"
                      >
                        Залишок до оплати:
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        {calculateRemainingPayment().toFixed(2)} ₴
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-10">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200"
          onClick={handleSubmit}
        >
          💾 Зберегти Зміни
        </button>
      </div>
    </div>
  );
}
