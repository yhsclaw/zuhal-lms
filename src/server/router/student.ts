import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const studentRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.search
        ? { name: { contains: input.search, mode: "insensitive" as const } }
        : {};

      return ctx.prisma.student.findMany({
        where,
        include: {
          lessons: {
            select: { id: true, attendance: true, startTime: true, scheduleId: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { name: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        firstLessonDate: z.date().optional(),
        instrument: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const name = `${input.firstName} ${input.lastName}`;
      return ctx.prisma.student.create({
        data: {
          name,
          firstLessonDate: input.firstLessonDate,
          instrument: input.instrument || undefined,
          phone: input.phone || undefined,
          notes: input.notes || undefined,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const student = await ctx.prisma.student.findUnique({
        where: { id: input.id },
        include: {
          lessons: {
            include: {
              schedule: true,
              chapters: { include: { chapter: true } },
              pdfs: { include: { pdf: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!student) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
      }

      return student;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
        firstLessonDate: z.date().nullable().optional(),
        instrument: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.student.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.student.delete({ where: { id: input.id } });
      return { success: true };
    }),

  merge: protectedProcedure
    .input(
      z.object({
        keepId: z.string(),
        mergeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.keepId === input.mergeId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot merge a student with themselves",
        });
      }

      return ctx.prisma.$transaction(async (tx) => {
        await tx.lesson.updateMany({
          where: { studentId: input.mergeId },
          data: { studentId: input.keepId },
        });

        await tx.student.delete({ where: { id: input.mergeId } });

        return tx.student.findUnique({
          where: { id: input.keepId },
          include: { lessons: true },
        });
      });
    }),
});
