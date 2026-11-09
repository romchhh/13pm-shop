"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/lib/FavoritesProvider";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { getLoyaltyTier, getLoyaltyTiersForProgress, LOYALTY_TIERS } from "@/lib/loyalty";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  clothingSize: string | null;
  birthDate: string | null;
  bonusPoints: number;
  image: string | null;
}

interface Order {
  id: number;
  customerName: string;
  createdAt: string;
  paymentStatus: string;
  paymentType?: string | null;
  status: string | null;
  novaPoshtaTtn?: string | null;
  npStatusCode?: string | null;
  npStatusName?: string | null;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl?: string | null;
    } | null;
  }>;
}

interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  discount_percentage: number | null;
  first_media?: { url: string; type: string } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { removeFavorite } = useFavorites();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "bonuses">("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "wishlist") setActiveTab("wishlist");
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    clothingSize: "",
    birthDate: "",
  });

  // Statistics state (setStats reserved for future stats API)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for stats fetch
  const [stats, setStats] = useState({
    totalSpent: 0,
    ordersCount: 0,
    favoriteSize: null as string | null,
    favoriteCategory: null as string | null,
  });

  const [loyaltyTierFromApi, setLoyaltyTierFromApi] = useState<{
    name: string;
    percent: number;
    nextTier: { threshold: number; percent: number; name: string } | null;
    progress: number;
  } | null>(null);

  const loyaltyTier = loyaltyTierFromApi ?? getLoyaltyTier(stats.totalSpent);
  const loyaltySteps = getLoyaltyTiersForProgress(stats.totalSpent);
  const maxThreshold = LOYALTY_TIERS[LOYALTY_TIERS.length - 1]?.threshold ?? 110_000;

  // Нова пошта: місто та відділення
  const [npCityInput, setNpCityInput] = useState("");
  const [npCitySelected, setNpCitySelected] = useState("");
  const [npWarehouseInput, setNpWarehouseInput] = useState("");
  const [, setNpWarehouseSelected] = useState("");
  const [npCitiesList, setNpCitiesList] = useState<string[]>([]);
  const [npWarehousesList, setNpWarehousesList] = useState<string[]>([]);
  const [npCitiesLoading, setNpCitiesLoading] = useState(false);
  const [npWarehousesLoading, setNpWarehousesLoading] = useState(false);
  const [npShowCityDropdown, setNpShowCityDropdown] = useState(false);
  const [npShowWarehouseDropdown, setNpShowWarehouseDropdown] = useState(false);
  const npCityInputRef = useRef<HTMLInputElement>(null);
  const npWarehouseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchOrders();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/users/loyalty")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.totalSpent != null) {
            setStats((prev) => ({ ...prev, totalSpent: Number(data.totalSpent) }));
          }
          if (data?.tierName != null && data?.bonusPercent != null) {
            setLoyaltyTierFromApi({
              name: data.tierName,
              percent: Number(data.bonusPercent),
              nextTier: data.nextTier ?? null,
              progress: Number(data.progress) ?? 0,
            });
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.email]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      const data = await res.json();
      setProfile(data);
      const addr = data.address || "";
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: addr,
        clothingSize: data.clothingSize || "",
        birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
      });
      const commaIdx = addr.indexOf(", ");
      if (commaIdx > 0) {
        setNpCitySelected(addr.slice(0, commaIdx));
        setNpCityInput(addr.slice(0, commaIdx));
        setNpWarehouseSelected(addr.slice(commaIdx + 2));
        setNpWarehouseInput(addr.slice(commaIdx + 2));
      } else if (addr) {
        setNpCityInput(addr);
        setNpWarehouseInput(addr);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const NP_API = "https://api.novaposhta.ua/v2.0/json/";
  const npApiKey = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY || "";

  useEffect(() => {
    if (!npCityInput || npCityInput.length < 2) {
      setNpCitiesList([]);
      return;
    }
    const t = setTimeout(() => {
      setNpCitiesLoading(true);
      fetch(NP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: npApiKey,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: { FindByString: npCityInput, limit: 20 },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setNpCitiesList(data.data.map((c: { Description: string }) => c.Description));
          } else {
            setNpCitiesList([]);
          }
        })
        .catch(() => setNpCitiesList([]))
        .finally(() => setNpCitiesLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [npCityInput, npApiKey]);

  useEffect(() => {
    if (!npCitySelected) {
      setNpWarehousesList([]);
      return;
    }
    setNpWarehousesLoading(true);
    fetch(NP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: npApiKey,
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: { CityName: npCitySelected, FindByString: "", limit: 50 },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNpWarehousesList(data.data.map((w: { Description: string }) => w.Description));
        } else {
          setNpWarehousesList([]);
        }
      })
      .catch(() => setNpWarehousesList([]))
      .finally(() => setNpWarehousesLoading(false));
  }, [npCitySelected, npApiKey]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/users/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/users/wishlist?full=1");
      if (res.ok) {
        const data = await res.json();
        setWishlistProducts(data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [session?.user, activeTab]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await fetch(`/api/users/wishlist/${productId}`, { method: "DELETE" });
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
      removeFavorite(productId);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--background-color-light,#F2F2F0)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#1C1C1C]/20 border-t-[#1C1C1C] rounded-full animate-spin" />
          <p className="font-['Montserrat'] text-sm tracking-wider uppercase text-[#1C1C1C]/60">
            Завантаження
          </p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-black/12 bg-white px-4 py-3.5 font-['Montserrat'] text-sm text-black placeholder:text-black/35 focus:border-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]/12 transition-colors";
  const labelClass =
    "block text-sm font-['Montserrat'] font-medium text-black/60 mb-2";
  const btnPrimary =
    "inline-flex items-center justify-center min-h-[3.25rem] rounded-2xl bg-[#1C1C1C] px-6 py-3.5 font-['Montserrat'] text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black";
  const btnGhost =
    "inline-flex items-center justify-center min-h-[3.25rem] rounded-2xl border border-[#1C1C1C] px-6 py-3 font-['Montserrat'] text-sm font-bold uppercase tracking-[0.12em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white";
  const panelClass =
    "rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] sm:p-6";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-[var(--site-accent,#5A6B47)]/12 text-[var(--site-accent-hover,#4A5A3A)]";
      case "pending":
        return "bg-amber-500/10 text-amber-800";
      case "canceled":
        return "bg-red-500/10 text-red-700";
      default:
        return "bg-[#1C1C1C]/06 text-[#1C1C1C]/70";
    }
  };

  const getStatusText = (status: string, paymentType?: string | null) => {
    if (paymentType === "test_payment") return "Тест оплата";
    if (status === "pending" && paymentType === "pay_after") {
      return "Оплата після";
    }
    switch (status) {
      case "paid":
        return "Оплачено";
      case "pending":
        return "Очікує оплати";
      case "canceled":
        return "Скасовано";
      default:
        return status;
    }
  };

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: "profile", label: "Профіль" },
    { id: "orders", label: "Замовлення" },
    { id: "wishlist", label: "Вішлист" },
    { id: "bonuses", label: "Бонуси" },
  ];

  const displayName = profile.name || session.user?.email || "Клієнт";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-8 sm:pt-10 pb-16 sm:pb-20">
      <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Montserrat'] tracking-tight text-[#1C1C1C]">
                Особистий кабінет
              </h1>
              <div className="mt-4 flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1C1C1C] text-white font-['Montserrat'] text-sm font-semibold">
                  {initials || "13"}
                </div>
                <div className="min-w-0">
                  <p className="font-['Montserrat'] text-base sm:text-lg text-[#1C1C1C] truncate">
                    {displayName}
                  </p>
                  <p className="text-xs sm:text-sm text-black/55 font-['Montserrat'] truncate">
                    {loyaltyTier.name} · −{loyaltyTier.percent}% на покупки
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="rounded-2xl border border-black/[0.06] bg-white px-4 py-3 min-w-[7.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <p className="text-xs text-black/45 font-['Montserrat']">Замовлень</p>
                <p className="mt-1 font-['Montserrat'] text-xl font-semibold tabular-nums text-[#1C1C1C]">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-2xl border border-black/[0.06] bg-white px-4 py-3 min-w-[7.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <p className="text-xs text-black/45 font-['Montserrat']">Бонуси</p>
                <p className="mt-1 font-['Montserrat'] text-xl font-semibold tabular-nums text-[#1C1C1C]">
                  {profile.bonusPoints ?? 0}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 border-b border-black/[0.06]">
          <nav
            className="flex gap-1 sm:gap-2 overflow-x-auto min-h-[48px] items-end"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 px-3 sm:px-4 pb-3.5 pt-2 font-['Montserrat'] text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#1C1C1C]"
                    : "text-black/40 hover:text-black/70"
                }`}
              >
                {tab.label}
                {tab.id === "orders" && orders.length > 0 ? (
                  <span className="ml-1.5 tabular-nums text-[10px] opacity-60">
                    {orders.length}
                  </span>
                ) : null}
                {activeTab === tab.id ? (
                  <span className="absolute left-3 right-3 sm:left-4 sm:right-4 bottom-0 h-0.5 rounded-full bg-[#1C1C1C]" />
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {activeTab === "profile" && (
            <div className="max-w-2xl w-full">
              {isEditing ? (
                <form
                  onSubmit={handleUpdateProfile}
                  className={`space-y-5 ${panelClass}`}
                >
                  <h2 className="font-['Montserrat'] text-lg sm:text-xl font-semibold tracking-tight text-[#1C1C1C]">
                    Редагування профілю
                  </h2>

                  <div>
                    <label className={labelClass}>Ім&apos;я</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Телефон</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputClass}
                      placeholder="+380..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Адреса доставки (Нова пошта)</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          ref={npCityInputRef}
                          type="text"
                          value={npCityInput}
                          onChange={(e) => {
                            setNpCityInput(e.target.value);
                            setNpShowCityDropdown(true);
                            if (!e.target.value) setNpCitySelected("");
                          }}
                          onFocus={() => npCitiesList.length > 0 && setNpShowCityDropdown(true)}
                          onBlur={() => setTimeout(() => setNpShowCityDropdown(false), 200)}
                          className={inputClass}
                          placeholder="Місто"
                          autoComplete="off"
                        />
                        {npCitiesLoading && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/35 text-sm">
                            …
                          </span>
                        )}
                        {npShowCityDropdown && npCitiesList.length > 0 && (
                          <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-black/10 bg-white py-1 font-['Montserrat'] text-sm shadow-lg">
                            {npCitiesList.map((name) => (
                              <li
                                key={name}
                                className="cursor-pointer px-4 py-2.5 hover:bg-black/[0.03]"
                                onMouseDown={() => {
                                  setNpCityInput(name);
                                  setNpCitySelected(name);
                                  setNpShowCityDropdown(false);
                                  setNpWarehouseInput("");
                                  setNpWarehouseSelected("");
                                  setFormData((prev) => ({ ...prev, address: "" }));
                                }}
                              >
                                {name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          ref={npWarehouseInputRef}
                          type="text"
                          value={npWarehouseInput}
                          onChange={(e) => {
                            setNpWarehouseInput(e.target.value);
                            setNpShowWarehouseDropdown(true);
                          }}
                          onFocus={() =>
                            npCitySelected &&
                            npWarehousesList.length > 0 &&
                            setNpShowWarehouseDropdown(true)
                          }
                          onBlur={() =>
                            setTimeout(() => setNpShowWarehouseDropdown(false), 200)
                          }
                          className={`${inputClass} disabled:bg-black/[0.03] disabled:cursor-not-allowed`}
                          placeholder="Відділення (спочатку оберіть місто)"
                          autoComplete="off"
                          disabled={!npCitySelected}
                        />
                        {npWarehousesLoading && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/35 text-sm">
                            …
                          </span>
                        )}
                        {npShowWarehouseDropdown && npWarehousesList.length > 0 && (
                          <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-black/10 bg-white py-1 font-['Montserrat'] text-sm shadow-lg">
                            {npWarehousesList
                              .filter((w) =>
                                w.toLowerCase().includes(npWarehouseInput.toLowerCase())
                              )
                              .map((name) => (
                                <li
                                  key={name}
                                  className="cursor-pointer px-4 py-2.5 hover:bg-black/[0.03]"
                                  onMouseDown={() => {
                                    setNpWarehouseInput(name);
                                    setNpWarehouseSelected(name);
                                    setNpShowWarehouseDropdown(false);
                                    setFormData((prev) => ({
                                      ...prev,
                                      address: `${npCitySelected}, ${name}`,
                                    }));
                                  }}
                                >
                                  {name}
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                      {formData.address && (
                        <p className="text-xs font-['Montserrat'] text-[#1C1C1C]/55">
                          Збережена адреса: {formData.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Розмір одягу</label>
                    <input
                      type="text"
                      value={formData.clothingSize}
                      onChange={(e) =>
                        setFormData({ ...formData, clothingSize: e.target.value })
                      }
                      className={inputClass}
                      placeholder="S, M, L, XL"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Дата народження
                      {profile.birthDate ? (
                        <span className="ml-2 normal-case tracking-normal font-normal text-[#1C1C1C]/40">
                          (не можна змінити)
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      disabled={!!profile.birthDate}
                      className={`${inputClass} disabled:bg-black/[0.03] disabled:cursor-not-allowed`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button type="submit" className={`${btnPrimary} w-full sm:w-auto`}>
                      Зберегти
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className={`${btnGhost} w-full sm:w-auto`}
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              ) : (
                <div className={`${panelClass} space-y-0`}>
                  <h2 className="mb-5 font-['Montserrat'] text-lg sm:text-xl font-semibold tracking-tight text-[#1C1C1C]">
                    Ваші дані
                  </h2>

                  {[
                    {
                      label: "Контакти",
                      value: (
                        <>
                          <span className="block">{profile.email || "Не вказано"}</span>
                          <span className="block mt-1">{profile.phone || "Не вказано"}</span>
                        </>
                      ),
                    },
                    {
                      label: "Адреса НП",
                      value: profile.address || "Не вказано",
                    },
                    {
                      label: "Розмір одягу",
                      value: profile.clothingSize || "Не вказано",
                    },
                    {
                      label: "Дата народження",
                      value: profile.birthDate
                        ? new Date(profile.birthDate).toLocaleDateString("uk-UA")
                        : "Не вказано",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-1 sm:gap-6 py-4 border-t border-black/[0.06] first:border-t-0 first:pt-0"
                    >
                      <dt className="text-sm font-['Montserrat'] text-black/45 pt-0.5">
                        {row.label}
                      </dt>
                      <dd className="font-['Montserrat'] text-sm sm:text-base text-[#1C1C1C] leading-relaxed">
                        {row.value}
                      </dd>
                    </div>
                  ))}

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className={`${btnPrimary} w-full sm:w-auto`}
                    >
                      Редагувати профіль
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 sm:mt-8 flex justify-start">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 font-['Montserrat'] text-xs uppercase tracking-[0.12em] text-[#1C1C1C]/50 hover:text-[#1C1C1C] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Вийти з акаунта
                </button>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="min-w-0">
              <h2 className="mb-5 sm:mb-6 font-['Montserrat'] text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1C1C]">
                Мої замовлення
              </h2>
              {!Array.isArray(orders) || orders.length === 0 ? (
                <div className={`${panelClass} py-14 text-center`}>
                  <p className="font-['Montserrat'] text-sm text-black/60 mb-5">
                    У вас поки немає замовлень
                  </p>
                  <Link href="/catalog" className={btnPrimary}>
                    До каталогу
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => {
                    const orderTotal = order.items.reduce(
                      (sum, item) => sum + Number(item.price) * item.quantity,
                      0
                    );
                    return (
                      <article
                        key={order.id}
                        className={panelClass}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                          <div className="min-w-0">
                            <p className="font-['Montserrat'] font-semibold text-sm sm:text-base text-[#1C1C1C]">
                              Замовлення #{order.id}
                            </p>
                            <p className="mt-1 text-xs text-[#1C1C1C]/50 font-['Montserrat']">
                              {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span
                            className={`self-start rounded-full px-3 py-1 text-[11px] font-['Montserrat'] font-semibold ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {getStatusText(order.paymentStatus, order.paymentType)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 text-sm min-w-0"
                            >
                              {item.product?.imageUrl ? (
                                <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#f5f5f4]">
                                  <Image
                                    src={`/api/images/${item.product.imageUrl}`}
                                    alt={item.product?.name || "Товар"}
                                    width={56}
                                    height={56}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-black/[0.04]">
                                  <span className="text-[10px] text-black/30">Фото</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="font-['Montserrat'] text-[#1C1C1C] line-clamp-2">
                                  {item.product?.name || "Товар"}
                                  <span className="text-black/45"> × {item.quantity}</span>
                                </span>
                              </div>
                              <span className="font-['Montserrat'] tabular-nums whitespace-nowrap flex-shrink-0 text-[#1C1C1C]">
                                {Number(item.price).toFixed(0)} грн
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-black/[0.06] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <p className="font-['Montserrat'] text-sm text-[#1C1C1C]">
                            <span className="mr-2 text-black/50">Разом</span>
                            <span className="font-semibold tabular-nums text-base">
                              {orderTotal.toFixed(0)} грн
                            </span>
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {order.novaPoshtaTtn ? (
                              <a
                                href={`https://novaposhta.ua/tracking/${order.novaPoshtaTtn}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-['Montserrat'] text-black/60 hover:text-[#1C1C1C] transition-colors"
                              >
                                ТТН {order.novaPoshtaTtn}
                              </a>
                            ) : null}
                            <Link
                              href={`/profile/orders/${order.id}`}
                              className={`${btnGhost} !min-h-[44px] !px-5 !text-xs`}
                            >
                              Деталі
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="min-w-0">
              <h2 className="mb-5 sm:mb-6 font-['Montserrat'] text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1C1C]">
                Вішлист
              </h2>
              {wishlistLoading ? (
                <div className="flex justify-center py-16">
                  <div className="h-8 w-8 border-2 border-[#1C1C1C]/20 border-t-[#1C1C1C] rounded-full animate-spin" />
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className={`${panelClass} py-14 text-center`}>
                  <p className="font-['Montserrat'] text-sm text-black/60 mb-5">
                    У вішлисті поки порожньо
                  </p>
                  <Link href="/catalog" className={btnPrimary}>
                    Переглянути каталог
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {wishlistProducts.map((item) => (
                    <div key={item.id} className="group relative flex flex-col gap-2.5">
                      <Link href={`/product/${item.id}`} className="block">
                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white border border-black/[0.06]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveFromWishlist(item.id);
                            }}
                            className="absolute top-2 right-2 z-10 rounded-full p-2 bg-white/90 text-[#1C1C1C] shadow-sm hover:bg-white transition-colors"
                            title="Прибрати з вішлиста"
                            aria-label="Прибрати з вішлиста"
                          >
                            <svg
                              className="w-3.5 h-3.5 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          {item.first_media?.type === "video" ? (
                            <video
                              src={`/api/images/${item.first_media.url}`}
                              className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-90"
                              loop
                              muted
                              playsInline
                              autoPlay
                              preload="none"
                            />
                          ) : (
                            <Image
                              src={getProductImageSrc(item.first_media)}
                              alt={`${item.name} — 13pm tactic`}
                              className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                              fill
                              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 pt-1">
                          <h3 className="text-sm font-['Montserrat'] text-[#1C1C1C] leading-snug uppercase tracking-wider">
                            {item.name}
                          </h3>
                          {item.discount_percentage ? (
                            <div className="flex items-baseline gap-1.5 flex-wrap font-['Montserrat']">
                              <span className="text-[#1C1C1C]/40 line-through text-sm">
                                {item.price.toLocaleString("uk-UA")} ₴
                              </span>
                              <span className="text-[var(--site-accent,#5A6B47)] text-xs font-medium">
                                −{item.discount_percentage}%
                              </span>
                              <span className="font-semibold text-[#1C1C1C] text-sm sm:text-base tabular-nums">
                                {(
                                  item.price *
                                  (1 - item.discount_percentage / 100)
                                ).toLocaleString("uk-UA", {
                                  maximumFractionDigits: 0,
                                })}{" "}
                                ₴
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-[#1C1C1C] text-sm sm:text-base tabular-nums font-['Montserrat']">
                              {item.price.toLocaleString("uk-UA")} ₴
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bonuses" && (
            <div className="space-y-4 sm:space-y-5 min-w-0 max-w-3xl">
              <h2 className="font-['Montserrat'] text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1C1C]">
                Мої бонуси
              </h2>

              <div className={panelClass}>
                <p className="text-sm font-['Montserrat'] text-black/45 mb-1">Ваш рівень</p>
                <p className="font-['Montserrat'] text-2xl font-semibold text-[#1C1C1C]">
                  {loyaltyTier.name}
                </p>
                <p className="mt-1 font-['Montserrat'] text-sm text-[var(--site-accent,#5A6B47)]">
                  Знижка {loyaltyTier.percent}% від кожної покупки
                </p>
                {loyaltyTier.nextTier && (
                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-['Montserrat'] text-black/50 mb-2">
                      <span className="truncate mr-2">
                        До рівня «{loyaltyTier.nextTier.name}»
                      </span>
                      <span className="flex-shrink-0 tabular-nums">
                        {Math.round(loyaltyTier.progress)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--site-accent,#5A6B47)] transition-[width] duration-500"
                        style={{ width: `${loyaltyTier.progress}%` }}
                      />
                    </div>
                    <p className="text-xs font-['Montserrat'] text-black/45 mt-2">
                      Накопичіть{" "}
                      {loyaltyTier.nextTier.threshold.toLocaleString("uk-UA")} ₴ для
                      знижки {loyaltyTier.nextTier.percent}%
                    </p>
                  </div>
                )}
              </div>

              <div className={panelClass}>
                <p className="text-sm font-['Montserrat'] text-black/45 mb-1">Шлях лояльності</p>
                <p className="text-sm font-['Montserrat'] text-black/60 mb-5">
                  Накопичено:{" "}
                  <span className="font-semibold text-[#1C1C1C] tabular-nums">
                    {stats.totalSpent.toLocaleString("uk-UA")} ₴
                  </span>
                </p>
                <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--site-accent,#5A6B47)] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (stats.totalSpent / maxThreshold) * 100)}%`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
                  {loyaltySteps.map((step) => (
                    <div
                      key={step.threshold}
                      className={`text-[10px] sm:text-[11px] text-center font-['Montserrat'] min-w-0 px-0.5 ${
                        step.isCurrent
                          ? "font-semibold text-[var(--site-accent,#5A6B47)]"
                          : step.reached
                            ? "text-black/70"
                            : "text-black/35"
                      }`}
                      title={`${step.name} — ${step.percent}%`}
                    >
                      <span className="block truncate">{step.name}</span>
                      <span className="block mt-0.5 tabular-nums">
                        {step.threshold === 0
                          ? "0"
                          : `${(step.threshold / 1000).toFixed(0)}k`}{" "}
                        ₴
                      </span>
                    </div>
                  ))}
                </div>
                {stats.totalSpent < maxThreshold && loyaltyTier.nextTier ? (
                  <p className="text-xs font-['Montserrat'] text-black/45 mt-4 pt-4 border-t border-black/[0.06]">
                    До «{loyaltyTier.nextTier.name}» залишилось{" "}
                    {Math.max(
                      0,
                      loyaltyTier.nextTier.threshold - stats.totalSpent
                    ).toLocaleString("uk-UA")}{" "}
                    ₴
                  </p>
                ) : null}
              </div>

              <p className="font-['Montserrat'] text-sm text-black/55 leading-relaxed px-1">
                Знижка нараховується з кожної покупки та застосовується на наступні
                (до 50% вартості товару).
              </p>

              <section className={`${panelClass} space-y-3`}>
                <h3 className="font-['Montserrat'] text-base sm:text-lg font-semibold text-[#1C1C1C]">
                  Програма лояльності 13pm
                </h3>
                <p className="font-['Montserrat'] text-sm text-black/60 leading-relaxed">
                  Бонусний рахунок дає змогу збирати бонуси і розраховуватись ними
                  під час покупок на сайті 13pm tactic.
                </p>
                <ul className="list-disc list-inside space-y-2 font-['Montserrat'] text-sm text-black/80">
                  <li>3% бонусу за першу покупку (незалежно від суми)</li>
                  <li>
                    5% від 25 000 грн, 7% від 45 000 грн, 10% від 65 000 грн, 12% від
                    90 000 грн, 15% від 110 000 грн
                  </li>
                  <li>500 грн бонусів у день народження</li>
                  <li>Індивідуальні спеціальні пропозиції та знижки</li>
                </ul>
                <p className="font-['Montserrat'] text-xs text-black/45 pt-1">
                  Ми відмовились від пластикових карт — бонусний рахунок віртуальний.
                </p>
              </section>

              <section className={`${panelClass} space-y-3`}>
                <h3 className="font-['Montserrat'] text-base sm:text-lg font-semibold text-[#1C1C1C]">
                  Важливо знати
                </h3>
                <ul className="list-disc list-inside space-y-2 font-['Montserrat'] text-sm text-black/65 leading-relaxed">
                  <li>Бонуси стають доступними наступного дня після покупки.</li>
                  <li>Бонусна карта не має терміну дії.</li>
                  <li>Бонусами може бути оплачено до 50% вартості товару.</li>
                  <li>
                    Бонусна система не поширюється на акційні товари, товари зі
                    знижками або промокодами та подарункові сертифікати.
                  </li>
                  <li>
                    Бонуси не нараховуються на частину суми чека, яка була оплачена
                    бонусами, купонами чи подарунковим сертифікатом.
                  </li>
                  <li>
                    У разі повернення товару, сплаченого бонусами, бонуси згорають.
                    При обміні на інший розмір — зберігаються.
                  </li>
                  <li>
                    У день народження — +500 грн бонусів (діють за 2 дні до, в день і
                    2 дні після).
                  </li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
