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
      const hash = process.env.ADMIN_PASSWORD_HASH;
      if (!hash) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Password hash not configured",
        });
      }

      const valid = await bcrypt.compare(input.password, hash);
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
