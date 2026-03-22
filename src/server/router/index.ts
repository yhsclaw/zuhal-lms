import { router } from "../trpc";
import { authRouter } from "./auth";
import { scheduleRouter } from "./schedule";
import { studentRouter } from "./student";
import { lessonRouter } from "./lesson";
import { chapterRouter } from "./chapter";
import { libraryRouter } from "./library";
import { reportRouter } from "./report";
import { songNotationRouter } from "./songNotation";

export const appRouter = router({
  auth: authRouter,
  schedule: scheduleRouter,
  student: studentRouter,
  lesson: lessonRouter,
  chapter: chapterRouter,
  library: libraryRouter,
  report: reportRouter,
  songNotation: songNotationRouter,
});

export type AppRouter = typeof appRouter;
