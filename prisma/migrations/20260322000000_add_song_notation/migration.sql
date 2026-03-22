-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'ADVANCED');

-- CreateTable
CREATE TABLE "song_notations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notation" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "song_notations_pkey" PRIMARY KEY ("id")
);
