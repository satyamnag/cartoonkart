import { Metadata } from "next";
import { CheckoutView } from "@/modules/checkout/ui/views/checkout-view";

export const metadata: Metadata = {
  title: "Checkout | CartoonKart",
  description: "Review your cart and complete your purchase.",
};

export const dynamic = "force-dynamic";

const Page = () => {
  return <CheckoutView />;
};

export default Page;