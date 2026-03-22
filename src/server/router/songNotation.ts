import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const songNotationRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          difficulty: z.enum(["BEGINNER", "ADVANCED"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.search) {
        where.title = { contains: input.search, mode: "insensitive" };
      }
      if (input?.difficulty) {
        where.difficulty = input.difficulty;
      }

      return ctx.prisma.songNotation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
      });
    }),

  search: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.songNotation.findMany({
        where: {
          title: { contains: input.title, mode: "insensitive" },
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const notation = await ctx.prisma.songNotation.findUnique({
        where: { id: input.id },
      });

      if (!notation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notasyon bulunamadı",
        });
      }

      return notation;
    }),

  save: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        notation: z.string().min(1),
        difficulty: z.enum(["BEGINNER", "ADVANCED"]).default("BEGINNER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        return ctx.prisma.songNotation.update({
          where: { id: input.id },
          data: {
            title: input.title,
            notation: input.notation,
            difficulty: input.difficulty,
          },
        });
      }

      return ctx.prisma.songNotation.create({
        data: {
          title: input.title,
          notation: input.notation,
          difficulty: input.difficulty,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.songNotation.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
