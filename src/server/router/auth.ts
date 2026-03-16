import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/auth";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const appPassword = process.env.APP_PASSWORD;
      const hash = process.env.ADMIN_PASSWORD_HASH;

      if (!appPassword && !hash) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Password not configured",
        });
      }

      // Support both plain APP_PASSWORD and hashed ADMIN_PASSWORD_HASH
      let valid = false;
      if (hash) {
        valid = await bcrypt.compare(input.password, hash);
      } else if (appPassword) {
        valid = input.password === appPassword;
      }

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      const token = await createSessionToken();
      const cookieStore = await cookies();
      cookieStore.set("zuhal-session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return { success: true };
    }),

  logout: protectedProcedure.mutation(async () => {
    const cookieStore = await cookies();
    cookieStore.delete("zuhal-session");
    return { success: true };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    return { authenticated: ctx.isAuthenticated };
  }),
});
