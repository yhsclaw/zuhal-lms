import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const scheduleRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.from || input?.to) {
        where.date = {
          ...(input.from && { gte: input.from }),
          ...(input.to && { lte: input.to }),
        };
      }

      return ctx.prisma.schedule.findMany({
        where,
        include: {
          lessons: {
            include: { student: true },
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { date: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.prisma.schedule.findUnique({
        where: { id: input.id },
        include: {
          lessons: {
            include: {
              student: true,
              chapters: { include: { chapter: true } },
              pdfs: { include: { pdf: true } },
            },
            orderBy: { startTime: "asc" },
          },
        },
      });

      if (!schedule) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Schedule not found" });
      }

      return schedule;
    }),

  import: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        teacherName: z.string().min(1),
        classroom: z.string().min(1),
        photoUrl: z.string().optional(),
        rawOcrText: z.string().optional(),
        lessons: z.array(
          z.object({
            studentName: z.string().min(1),
            startTime: z.string().regex(/^\d{2}:\d{2}$/),
            durationMin: z.number().optional(),
            isTrial: z.boolean().default(false),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const schedule = await tx.schedule.create({
          data: {
            date: input.date,
            teacherName: input.teacherName,
            classroom: input.classroom,
            photoUrl: input.photoUrl,
            rawOcrText: input.rawOcrText,
          },
        });

        for (const lessonInput of input.lessons) {
          let student = await tx.student.findFirst({
            where: { name: { equals: lessonInput.studentName, mode: "insensitive" } },
          });

          if (!student) {
            student = await tx.student.create({
              data: { name: lessonInput.studentName },
            });
          }

          await tx.lesson.create({
            data: {
              scheduleId: schedule.id,
              studentId: student.id,
              startTime: lessonInput.startTime,
              durationMin: lessonInput.durationMin,
              isTrial: lessonInput.isTrial,
            },
          });
        }

        return tx.schedule.findUnique({
          where: { id: schedule.id },
          include: {
            lessons: {
              include: { student: true },
              orderBy: { startTime: "asc" },
            },
          },
        });
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.schedule.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
