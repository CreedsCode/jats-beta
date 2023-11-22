/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from "@prisma/client";
import { type DefaultSession, type NextAuthOptions, getServerSession } from "next-auth";

import DiscordProvider from "next-auth/providers/discord";
import Email from "next-auth/providers/email";
import { StringDecoder } from "string_decoder";

import { env } from "~/env.mjs";
import { db } from "~/server/db";


/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
export type UserRole = "Admin" | "Customer";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string,
//       name: string,
//       email: string,
//       emailVerified: Date,
//       image: string,
//       role: UserRole
//       eslint - disable - next - line @typescript-eslint / no - redundant - type - constituents
// } & DefaultSession["user"];
//   }

// interface User {
//   // ...other properties
//   // role: UserRole;
// }
// }

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
    jwt({ token, user }) {
      console.log("jwt callback", token, user)
      if (user) token.role = user.role
      console.log("jwt token with role")
      return token
    },
    // If you want to use the role in client components
    session({ session, token }) {
      console.log("session callback", session, token)
      if (session?.user) session.user.role = token.role
      return session
    },

    // https://github.com/Md-Zainulabdin/Role-Based-Authentication-NextJs/commit/24dacbfff027969891b64819906fdfb3a44b844e
    // https://authjs.dev/guides/providers/email-http
    async signIn({ user, account, email }) {
      console.log("user", user);
      console.log("account", account);
      console.log("email", email);
      // await db.$connect();
      const userExists = await db.user.findFirst({
        where: { email: user.userId }
      });
      console.log("userExists", userExists)
      if (userExists) {
        if (userExists?.role === null) {
          console.log("UserExists is missing a role");
          if (userExists?.email === env.WHITELISTED_EMAIL) {
            await db.user.update({ where: { id: userExists.id }, data: { role: "Admin" } })
            return "/dashboard/events"
          } else {
            await db.user.update({ where: { id: userExists.id }, data: { role: "Customer" } })
            return true
          }
        }

        return true;   //if the email exists in the User collection, email them a magic login link
      } else {
        return true;
      }
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Email({

      server: {
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
