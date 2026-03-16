-- CreateEnum
CREATE TYPE "Attendance" AS ENUM ('PENDING', 'PRESENT', 'ABSENT');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "firstLessonDate" DATE,
    "instrument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "teacherName" TEXT NOT NULL,
    "classroom" TEXT NOT NULL,
    "photoUrl" TEXT,
    "rawOcrText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMin" INTEGER,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "attendance" "Attendance" NOT NULL DEFAULT 'PENDING',
    "homeworkNotes" TEXT,
    "practiceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "lesson_chapters" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "lesson_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_exercises" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_pdfs" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "pdfId" TEXT NOT NULL,

    CONSTRAINT "lesson_pdfs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_chapters_lessonId_chapterNumber_key" ON "lesson_chapters"("lessonId", "chapterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_pdfs_lessonId_pdfId_key" ON "lesson_pdfs"("lessonId", "pdfId");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_chapters" ADD CONSTRAINT "lesson_chapters_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_chapters" ADD CONSTRAINT "lesson_chapters_chapterNumber_fkey" FOREIGN KEY ("chapterNumber") REFERENCES "chapters"("number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_pdfs" ADD CONSTRAINT "lesson_pdfs_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_pdfs" ADD CONSTRAINT "lesson_pdfs_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "pdf_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
