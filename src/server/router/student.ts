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
          _count: { select: { lessons: true } },
        },
        orderBy: { name: "asc" },
      }).then(async (students) => {
        // Fetch last D52 chapter for each student
        const studentIds = students.map((s) => s.id);
        const lastChapters = await ctx.prisma.lessonChapter.findMany({
          where: { lesson: { studentId: { in: studentIds } } },
          orderBy: { lesson: { createdAt: "desc" } },
          include: { chapter: true },
          distinct: ["lessonId"],
        });

        // Group by studentId via lesson relation — need a second query for mapping
        const chaptersByStudent = new Map<string, { number: number; title: string }>();
        // Get lesson->student mapping for these chapters
        const lessonIds = [...new Set(lastChapters.map((lc) => lc.lessonId))];
        const lessonStudentMap = await ctx.prisma.lesson.findMany({
          where: { id: { in: lessonIds } },
          select: { id: true, studentId: true, createdAt: true },
        });
        const lessonToStudent = new Map(lessonStudentMap.map((l) => [l.id, { studentId: l.studentId, createdAt: l.createdAt }]));

        for (const lc of lastChapters) {
          const lessonInfo = lessonToStudent.get(lc.lessonId);
          if (!lessonInfo) continue;
          const existing = chaptersByStudent.get(lessonInfo.studentId);
          // Keep the highest chapter number from the most recent lessons
          if (!existing || lc.chapterNumber > existing.number) {
            chaptersByStudent.set(lessonInfo.studentId, {
              number: lc.chapterNumber,
              title: lc.chapter.title,
            });
          }
        }

        return students.map((s) => ({
          ...s,
          lastChapter: chaptersByStudent.get(s.id) ?? null,
        }));
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
      const lessonCount = await ctx.prisma.lesson.count({ where: { studentId: input.id } });
      if (lessonCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Bu öğrencinin ${lessonCount} ders kaydı var. Önce dersleri silin.`,
        });
      }
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
