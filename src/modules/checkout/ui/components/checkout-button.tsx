// src/modules/checkout/ui/components/checkout-button.tsx
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useCart } from "../../hooks/use-cart";

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
}

export const CheckoutButton = ({
  className,
  hideIfEmpty,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart();

  if (hideIfEmpty && totalItems === 0) return null;

  return (
    <Button
      variant="elevated"
      asChild
      className={cn(
        "bg-white cursor-pointer",
        // Prevent the built‑in hover translate from breaking the click target
        "hover:!translate-x-0 hover:!translate-y-0",
        className
      )}
    >
      <Link href="/checkout">
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};