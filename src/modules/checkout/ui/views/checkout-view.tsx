// src/modules/checkout/ui/views/checkout-view.tsx
"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { useCart } from "../../hooks/use-cart";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { useCheckoutStates } from "../../hooks/use-checkout-states";

interface CheckoutViewProps {}

export const CheckoutView = ({}: CheckoutViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [states, setStates] = useCheckoutStates();
  const { productIds, removeProduct, clearCart } = useCart();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({ ids: productIds })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(error.message);
      },
    })
  );

  const confirmPurchase = useMutation(
    trpc.checkout.confirmPurchase.mutationOptions({
      onSuccess: () => {
        clearCart();
        queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
        router.push("/library");
      },
      onError: (error) => {
        toast.error(error.message);
        // Still clear cart and go to library even if confirmation fails (webhook may handle it)
        clearCart();
        router.push("/library");
      },
    })
  );

  useEffect(() => {
    if (states.success) {
      const sessionId = searchParams.get("session_id");
      if (sessionId) {
        confirmPurchase.mutate({ sessionId });
      } else {
        // If no session ID (e.g., someone manually typed ?success=true), just clear and go
        clearCart();
        router.push("/library");
      }
      setStates({ success: false, cancel: false });
    }
  }, [states.success, searchParams, confirmPurchase, clearCart, router, setStates]);

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart cleared");
    }
  }, [error, clearCart]);

  if (isLoading) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-16 pt-4 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`/products/${product.id}`}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data?.totalPrice || 0}
            onPurchase={() => purchase.mutate({ productIds })}
            isCanceled={states.cancel}
            disabled={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
};