// src/app/(app)/api/stripe/webhooks/route.ts
import type { Stripe } from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (error! instanceof Error) {
      console.log(error);
    }

    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    )
  }

  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
  ];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const data = event.data.object as Stripe.Checkout.Session;

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }
          if (!data.metadata?.productIds) {
            throw new Error("Product IDs are required");
          }

          const userId = data.metadata.userId;
          const productIds: string[] = JSON.parse(data.metadata.productIds);

          // Verify user exists
          const user = await payload.findByID({
            collection: "users",
            id: userId,
          });
          if (!user) {
            throw new Error("User not found");
          }

          // Create an order for each product (skip duplicates)
          for (const productId of productIds) {
            const existing = await payload.find({
              collection: "orders",
              where: {
                and: [
                  { stripeCheckoutSessionId: { equals: data.id } },
                  { product: { equals: productId } },
                ],
              },
              limit: 1,
            });
            if (existing.docs.length > 0) continue;

            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                user: userId,
                product: productId,
                name: `Order for session ${data.id}`,
              },
            });
          }
          break;
        }
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
};