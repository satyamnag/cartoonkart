// src/modules/checkout/ui/components/checkout-button.tsx
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

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
    <Link
      href="/checkout"
      className={cn(
        // Elevated button style
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all",
        "bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "h-12 px-4 py-2 has-[>svg]:px-3",
        "cursor-pointer",
        // Prevent any hover translation
        "hover:translate-x-0 hover:translate-y-0",
        className
      )}
    >
      <ShoppingCartIcon />
      {totalItems > 0 ? totalItems : ""}
    </Link>
  );
};