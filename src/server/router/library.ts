import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { deletePdfFile } from "../services/pdf";

export const libraryRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.search
        ? { title: { contains: input.search, mode: "insensitive" as const } }
        : {};

      return ctx.prisma.pdfExercise.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  upload: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        fileName: z.string().min(1),
        filePath: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.pdfExercise.create({
        data: {
          title: input.title,
          fileName: input.fileName,
          filePath: input.filePath,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pdf = await ctx.prisma.pdfExercise.findUnique({
        where: { id: input.id },
      });

      if (!pdf) {
        throw new TRPCError({ code: "NOT_FOUND", message: "PDF not found" });
      }

      await deletePdfFile(pdf.filePath);
      await ctx.prisma.pdfExercise.delete({ where: { id: input.id } });

      return { success: true };
    }),
});
