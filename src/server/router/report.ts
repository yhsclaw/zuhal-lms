import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const reportRouter = router({
  monthly: protectedProcedure
    .input(
      z.object({
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 1);

      const lessons = await ctx.prisma.lesson.findMany({
        where: {
          attendance: "PRESENT",
          schedule: {
            date: { gte: startDate, lt: endDate },
          },
        },
        include: {
          student: true,
          schedule: { select: { date: true } },
        },
      });

      const totalLessons = lessons.length;
      const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMin ?? 45), 0);
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
      const trialLessons = lessons.filter((l) => l.isTrial).length;

      return {
        year: input.year,
        month: input.month,
        totalLessons,
        totalMinutes,
        totalHours,
        trialLessons,
        regularLessons: totalLessons - trialLessons,
      };
    }),

  studentMonthly: protectedProcedure
    .input(
      z.object({
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 1);

      const lessons = await ctx.prisma.lesson.findMany({
        where: {
          attendance: "PRESENT",
          schedule: {
            date: { gte: startDate, lt: endDate },
          },
        },
        include: {
          student: true,
          schedule: { select: { date: true } },
        },
      });

      const studentMap = new Map<
        string,
        {
          studentId: string;
          studentName: string;
          lessonCount: number;
          totalMinutes: number;
          trialCount: number;
        }
      >();

      for (const lesson of lessons) {
        const existing = studentMap.get(lesson.studentId);
        const mins = lesson.durationMin ?? 45;

        if (existing) {
          existing.lessonCount += 1;
          existing.totalMinutes += mins;
          if (lesson.isTrial) existing.trialCount += 1;
        } else {
          studentMap.set(lesson.studentId, {
            studentId: lesson.studentId,
            studentName: lesson.student.name,
            lessonCount: 1,
            totalMinutes: mins,
            trialCount: lesson.isTrial ? 1 : 0,
          });
        }
      }

      return {
        year: input.year,
        month: input.month,
        students: Array.from(studentMap.values()).sort((a, b) =>
          a.studentName.localeCompare(b.studentName),
        ),
      };
    }),
});
