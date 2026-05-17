// src/modules/auth/server/procedures.ts
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import { cookies as getCookies } from "next/headers";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { generateAuthCookie } from "../utils";
import { loginSchema, registerSchema } from "../schemas";

// Helper to set the roles cookie (1 hour)
const setRolesCookie = async (roles: string[]) => {
  const cookies = await getCookies();
  cookies.set({
    name: "user-roles",
    value: JSON.stringify(roles),
    path: "/",
    maxAge: 3600,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
};

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.db.auth({ headers });
    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: { username: { equals: input.username } },
      });

      if (existingData.docs[0]) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Username already taken" });
      }

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password,
        },
      });

      const data = await ctx.db.login({
        collection: "users",
        data: { email: input.email, password: input.password },
      });

      if (!data.token) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to login" });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });

      // Set roles cookie from the logged-in user
      await setRolesCookie(data.user.roles ?? []);

      return data;
    }),
  login: baseProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.login({
        collection: "users",
        data: { email: input.email, password: input.password },
      });

      if (!data.token) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Failed to login" });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });

      // Set roles cookie from the logged-in user
      await setRolesCookie(data.user.roles ?? []);

      return data;
    }),
});