// src/modules/products/ui/components/cart-button.tsx
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  productId: string;
  isPurchased?: boolean;
};

export const CartButton = ({ productId, isPurchased }: Props) => {
  const cart = useCart();

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        asChild
        className="flex-1 font-medium bg-white"
      >
        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`}>
          View in Library
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="elevated"
      className={cn("flex-1 bg-pink-400", cart.isProductInCart(productId) && "bg-white")}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId)
        ? "Remove from cart"
        : "Add to cart"
      }
    </Button>
  );
};