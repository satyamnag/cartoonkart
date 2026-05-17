// src/modules/checkout/hooks/use-cart.ts
import { useCallback } from "react";
import { useCartStore } from "../store/use-cart-store";

export const useCart = () => {
  const productIds = useCartStore((state) => state.productIds);
  const addProduct = useCartStore((state) => state.addProduct);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearCart = useCartStore((state) => state.clearCart);

  const toggleProduct = useCallback((productId: string) => {
    if (productIds.includes(productId)) {
      removeProduct(productId);
    } else {
      addProduct(productId);
    }
  }, [productIds, addProduct, removeProduct]);

  const isProductInCart = useCallback((productId: string) => {
    return productIds.includes(productId);
  }, [productIds]);

  return {
    productIds,
    addProduct,
    removeProduct,
    clearCart,
    toggleProduct,
    isProductInCart,
    totalItems: productIds.length,
  };
};