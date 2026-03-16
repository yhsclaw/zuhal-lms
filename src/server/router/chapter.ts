import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const chapterRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chapter.findMany({
      orderBy: { number: "asc" },
    });
  }),

  getProgress: protectedProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const lessonChapters = await ctx.prisma.lessonChapter.findMany({
        where: {
          lesson: { studentId: input.studentId },
        },
        include: {
          chapter: true,
          lesson: {
            select: {
              id: true,
              startTime: true,
              createdAt: true,
              schedule: { select: { date: true } },
            },
          },
        },
        orderBy: { lesson: { createdAt: "asc" } },
      });

      const allChapters = await ctx.prisma.chapter.findMany({
        orderBy: { number: "asc" },
      });

      const coveredNumbers = new Set(lessonChapters.map((lc) => lc.chapterNumber));

      return {
        chapters: allChapters.map((ch) => ({
          ...ch,
          covered: coveredNumbers.has(ch.number),
          lessonCount: lessonChapters.filter((lc) => lc.chapterNumber === ch.number).length,
        })),
        timeline: lessonChapters,
      };
    }),
});
