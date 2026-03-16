import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { prisma } from "./db";

export async function createTRPCContext() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("zuhal-session")?.value;
  const isAuthenticated = sessionToken ? await verifySession(sessionToken) : false;

  return {
    prisma,
    isAuthenticated,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.isAuthenticated) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({ ctx });
});
