/*
  Warnings:

  - You are about to drop the `Objective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionTypeUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Objective" DROP CONSTRAINT "Objective_sessionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Objective" DROP CONSTRAINT "Objective_sessionUnitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Objective" DROP CONSTRAINT "Objective_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_sessionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionTypeUnit" DROP CONSTRAINT "SessionTypeUnit_sessionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionTypeUnit" DROP CONSTRAINT "SessionTypeUnit_sessionUnitId_fkey";

-- DropTable
DROP TABLE "public"."Objective";

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."SessionType";

-- DropTable
DROP TABLE "public"."SessionTypeUnit";

-- DropTable
DROP TABLE "public"."SessionUnit";

-- CreateTable
CREATE TABLE "SleepSession" (
    "id" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "quality" INTEGER,
    "dateSession" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "SleepSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeditationSession" (
    "id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "quality" INTEGER,
    "dateSession" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "MeditationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "quality" INTEGER,
    "dateSession" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,

    CONSTRAINT "ExerciceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciceSession" (
    "workoutSessionId" TEXT NOT NULL,
    "exerciceTypeId" TEXT NOT NULL,
    "repetitionCount" INTEGER NOT NULL,

    CONSTRAINT "ExerciceSession_pkey" PRIMARY KEY ("workoutSessionId","exerciceTypeId")
);

-- AddForeignKey
ALTER TABLE "SleepSession" ADD CONSTRAINT "SleepSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeditationSession" ADD CONSTRAINT "MeditationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceSession" ADD CONSTRAINT "ExerciceSession_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceSession" ADD CONSTRAINT "ExerciceSession_exerciceTypeId_fkey" FOREIGN KEY ("exerciceTypeId") REFERENCES "ExerciceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
