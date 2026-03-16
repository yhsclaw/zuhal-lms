import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const lessonRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.id },
        include: {
          student: true,
          schedule: true,
          chapters: { include: { chapter: true }, orderBy: { chapterNumber: "asc" } },
          pdfs: { include: { pdf: true } },
        },
      });

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }

      return lesson;
    }),

  setAttendance: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        attendance: z.enum(["PENDING", "PRESENT", "ABSENT"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lesson.update({
        where: { id: input.id },
        data: { attendance: input.attendance },
      });
    }),

  setDuration: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        durationMin: z.number().refine((v) => v === 25 || v === 45),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lesson.update({
        where: { id: input.id },
        data: { durationMin: input.durationMin },
      });
    }),

  toggleTrial: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { id: input.id },
      });

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }

      return ctx.prisma.lesson.update({
        where: { id: input.id },
        data: { isTrial: !lesson.isTrial },
      });
    }),

  updateHomework: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        homeworkNotes: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lesson.update({
        where: { id: input.id },
        data: { homeworkNotes: input.homeworkNotes },
      });
    }),

  updatePracticeNotes: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        practiceNotes: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lesson.update({
        where: { id: input.id },
        data: { practiceNotes: input.practiceNotes },
      });
    }),

  setChapters: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        chapters: z.array(
          z.object({
            chapterNumber: z.number().int().min(1).max(52),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.lessonChapter.deleteMany({ where: { lessonId: input.id } });

        await tx.lessonChapter.createMany({
          data: input.chapters.map((ch) => ({
            lessonId: input.id,
            chapterNumber: ch.chapterNumber,
            notes: ch.notes,
          })),
        });

        return tx.lesson.findUnique({
          where: { id: input.id },
          include: { chapters: { include: { chapter: true } } },
        });
      });
    }),

  attachPdfs: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        pdfIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.lessonPdf.deleteMany({ where: { lessonId: input.id } });

        await tx.lessonPdf.createMany({
          data: input.pdfIds.map((pdfId) => ({
            lessonId: input.id,
            pdfId,
          })),
        });

        return tx.lesson.findUnique({
          where: { id: input.id },
          include: { pdfs: { include: { pdf: true } } },
        });
      });
    }),
});
