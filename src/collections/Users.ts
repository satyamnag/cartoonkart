// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { cookies } from 'next/headers'

import { isSuperAdmin } from '@/lib/access';

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    read: () => true,
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req, id }) => {
      if (isSuperAdmin(req.user)) return true;

      return req.user?.id === id;
    }
  },
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !isSuperAdmin(user),
  },
  auth: {
    cookies: {
      ...(process.env.NODE_ENV !== "development" && {
        sameSite: "None",
        domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        secure: true,
      }),
    }
  },
  hooks: {
    afterLogin: [
      async ({ user }) => {
        // Set the user-roles cookie so the admin middleware can authorise access
        const cookieStore = await cookies();
        cookieStore.set({
          name: "user-roles",
          value: JSON.stringify(user.roles ?? []),
          path: "/",
          maxAge: 3600,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
        });
      },
    ],
  },
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      admin: {
        position: "sidebar",
      },
      name: "roles",
      type: "select",
      defaultValue: [],
      hasMany: true,
      options: ["super-admin", "user", "product-manager"],
      access: {
        update: ({ req }) => isSuperAdmin(req.user),
      }
    },
  ],
};