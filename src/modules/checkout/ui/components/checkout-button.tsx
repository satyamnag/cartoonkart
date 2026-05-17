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
    <Button variant="elevated" asChild className={cn("bg-white", className)}>
      <Link href="/checkout">
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};