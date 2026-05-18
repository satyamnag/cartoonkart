// src/modules/checkout/server/procedures.ts
import z from "zod";
import type Stripe from "stripe";

import { TRPCError } from "@trpc/server";

import { stripe } from "@/lib/stripe";
import { Media } from "@/payload-types";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { headers as getHeaders } from "next/headers";

export const checkoutRouter = createTRPCRouter({
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.db.find({
        collection: "products",
        depth: 0, // we only need price & name
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              }
            },
            {
              isArchived: {
                not_equals: true,
              },
            }
          ]
        }
      })

      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" });
      }

      // Build dynamic base URL from the current request host
      const headersList = await getHeaders();
      const host = headersList.get("host") || headersList.get("x-forwarded-host") || process.env.NEXT_PUBLIC_APP_URL!;
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const baseUrl = `${protocol}://${host}`;

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        products.docs.map((product) => ({
          quantity: 1,
          price_data: {
            unit_amount: product.price * 100, // Stripe handles prices in paise (INR smallest unit)
            currency: "inr",
            product_data: {
              name: product.name,
            }
          }
        }));

      const checkout = await stripe.checkout.sessions.create({
        customer_email: ctx.session.user.email,
        success_url: `${baseUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?cancel=true`,
        mode: "payment",
        line_items: lineItems,
        invoice_creation: {
          enabled: true,
        },
        metadata: {
          userId: ctx.session.user.id,
          productIds: JSON.stringify(input.productIds), // Store product IDs for the webhook
        },
      });

      if (!checkout.url) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create checkout session" });
      }

      return { url: checkout.url };
    }),

  confirmPurchase: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Retrieve the Stripe session
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (!session?.metadata?.userId || !session?.metadata?.productIds) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid session data" });
      }

      const userId = session.metadata.userId;
      const productIds: string[] = JSON.parse(session.metadata.productIds);

      // Ensure the session belongs to the logged‑in user
      if (userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Session does not belong to you" });
      }

      // Create orders (idempotent – skip if already exists)
      for (const productId of productIds) {
        const existing = await ctx.db.find({
          collection: "orders",
          where: {
            and: [
              { stripeCheckoutSessionId: { equals: input.sessionId } },
              { product: { equals: productId } },
            ],
          },
          limit: 1,
        });
        if (existing.docs.length > 0) continue;

        await ctx.db.create({
          collection: "orders",
          data: {
            stripeCheckoutSessionId: input.sessionId,
            user: userId,
            product: productId,
            name: `Order for session ${input.sessionId}`,
          },
        });
      }

      return { success: true };
    }),

  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "products",
        depth: 1, // Populate "image"
        where: {
          and: [
            {
              id: {
                in: input.ids,
              },
            },
            {
              isArchived: {
                not_equals: true,
              },
            },
          ],
        },
      });

      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Products not found" });
      }

      const totalPrice = data.docs.reduce((acc, product) => {
        const price = Number(product.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);

      return {
        ...data,
        totalPrice: totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
        }))
      }
    }),
});