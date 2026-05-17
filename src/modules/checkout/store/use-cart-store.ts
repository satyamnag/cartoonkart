// src/modules/checkout/store/use-cart-store.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartState {
  productIds: string[];
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      productIds: [],
      addProduct: (productId) =>
        set((state) => ({
          productIds: [...state.productIds, productId],
        })),
      removeProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),
      clearCart: () =>
        set({ productIds: [] }),
    }),
    {
      name: "cartoonkart-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);