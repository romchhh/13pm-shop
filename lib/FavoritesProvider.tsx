"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  FAVORITES_STORAGE_KEY,
  parseFavoritesFromStorage,
  type FavoriteProductSnapshot,
} from "@/lib/favoritesStorage";

type FavoritesContextType = {
  items: FavoriteProductSnapshot[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: FavoriteProductSnapshot) => void;
  removeFavorite: (productId: number) => void;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<FavoriteProductSnapshot[]>([]);
  const syncedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      setItems(parseFavoritesFromStorage(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  // Після логіну: підтягнути wishlist з сервера і злити локальні
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      syncedForUserRef.current = null;
      return;
    }
    const userId = session.user.id;
    if (syncedForUserRef.current === userId) return;
    syncedForUserRef.current = userId;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users/wishlist");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const serverIds: number[] = Array.isArray(data.productIds)
          ? data.productIds
          : [];

        const local = parseFavoritesFromStorage(
          localStorage.getItem(FAVORITES_STORAGE_KEY)
        );
        const localMissing = local.filter((p) => !serverIds.includes(p.id));

        await Promise.all(
          localMissing.map((p) =>
            fetch("/api/users/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: p.id }),
            }).catch(() => null)
          )
        );

        if (cancelled) return;

        const merged = [
          ...local,
          ...serverIds
            .filter((id) => !local.some((p) => p.id === id))
            .map((id) => ({ id, name: `Товар #${id}` }) as FavoriteProductSnapshot),
        ];
        setItems(merged);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  const isFavorite = useCallback(
    (productId: number) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleFavorite = useCallback(
    (product: FavoriteProductSnapshot) => {
      setItems((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        if (exists) {
          if (status === "authenticated") {
            fetch(`/api/users/wishlist/${product.id}`, { method: "DELETE" }).catch(
              () => null
            );
          }
          return prev.filter((p) => p.id !== product.id);
        }
        if (status === "authenticated") {
          fetch("/api/users/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          }).catch(() => null);
        }
        return [product, ...prev.filter((p) => p.id !== product.id)];
      });
    },
    [status]
  );

  const removeFavorite = useCallback(
    (productId: number) => {
      setItems((prev) => prev.filter((p) => p.id !== productId));
      if (status === "authenticated") {
        fetch(`/api/users/wishlist/${productId}`, { method: "DELETE" }).catch(
          () => null
        );
      }
    },
    [status]
  );

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      count,
    }),
    [items, isFavorite, toggleFavorite, removeFavorite, count]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
