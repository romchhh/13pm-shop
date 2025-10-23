"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface BasketItem {
  id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
  color?: string;
  discount_percentage?: number;
}

interface BasketContextType {
  items: BasketItem[];
  addItem: (item: BasketItem) => void;
  removeItem: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "basketItems";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  // Load from localStorage only on client side after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Handle localStorage read errors
    }
  }, []);

  // Save basket items to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Handle localStorage write errors if needed
    }
  }, [items]);

  function addItem(newItem: BasketItem) {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) =>
          i.id === newItem.id &&
          i.size === newItem.size &&
          i.color === newItem.color
      );
      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prevItems, newItem];
    });
  }

  function removeItem(id: number, size: string) {
    setItems((prev) =>
      prev.filter((item) => item.id !== id || item.size !== size)
    );
  }

  function updateQuantity(id: number, size: string, quantity: number) {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === id && item.size === size) {
          return { ...item, quantity: Math.max(quantity, 1) };
        }
        return item;
      });
    });
  }

  function clearBasket() {
    setItems([]);
  }

  return (
    <BasketContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearBasket }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
