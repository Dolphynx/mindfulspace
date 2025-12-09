/*
  Warnings:

  - The values [WORKOUT_PROGRAM] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `ExerciceSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `exerciceTypeId` on the `ExerciceSession` table. All the data in the column will be lost.
  - You are about to drop the column `repetitionCount` on the `ExerciceSession` table. All the data in the column will be lost.
  - You are about to drop the column `workoutSessionId` on the `ExerciceSession` table. All the data in the column will be lost.
  - You are about to drop the column `exerciceTypeId` on the `ExerciceStep` table. All the data in the column will be lost.
  - You are about to drop the `ExerciceType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutProgram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutProgramDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutProgramExercice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[exerciceContentId,order]` on the table `ExerciceStep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateSession` to the `ExerciceSession` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ExerciceSession` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `exerciceContentId` to the `ExerciceStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('ARTICLE', 'VIDEO', 'MEDITATION_PROGRAM', 'EXERCICE_PROGRAM', 'GUIDE');
ALTER TABLE "Resource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "public"."ResourceType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."ExerciceSession" DROP CONSTRAINT "ExerciceSession_exerciceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExerciceSession" DROP CONSTRAINT "ExerciceSession_workoutSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExerciceStep" DROP CONSTRAINT "ExerciceStep_exerciceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutProgramDay" DROP CONSTRAINT "WorkoutProgramDay_workoutProgramId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutProgramExercice" DROP CONSTRAINT "WorkoutProgramExercice_exerciceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutProgramExercice" DROP CONSTRAINT "WorkoutProgramExercice_programDayId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkoutSession" DROP CONSTRAINT "WorkoutSession_userId_fkey";

-- DropIndex
DROP INDEX "public"."ExerciceStep_exerciceTypeId_order_key";

-- AlterTable
ALTER TABLE "ExerciceSession" DROP CONSTRAINT "ExerciceSession_pkey",
DROP COLUMN "exerciceTypeId",
DROP COLUMN "repetitionCount",
DROP COLUMN "workoutSessionId",
ADD COLUMN     "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateSession" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "quality" INTEGER,
ADD COLUMN     "userId" TEXT,
ADD CONSTRAINT "ExerciceSession_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ExerciceStep" DROP COLUMN "exerciceTypeId",
ADD COLUMN     "exerciceContentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."ExerciceType";

-- DropTable
DROP TABLE "public"."WorkoutProgram";

-- DropTable
DROP TABLE "public"."WorkoutProgramDay";

-- DropTable
DROP TABLE "public"."WorkoutProgramExercice";

-- DropTable
DROP TABLE "public"."WorkoutSession";

-- CreateTable
CREATE TABLE "ExerciceContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,

    CONSTRAINT "ExerciceContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciceSerie" (
    "exerciceSessionId" TEXT NOT NULL,
    "exerciceContentId" TEXT NOT NULL,
    "repetitionCount" INTEGER NOT NULL,

    CONSTRAINT "ExerciceSerie_pkey" PRIMARY KEY ("exerciceSessionId","exerciceContentId")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDay" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "weekday" INTEGER,

    CONSTRAINT "ProgramDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramExerciceItem" (
    "id" TEXT NOT NULL,
    "programDayId" TEXT NOT NULL,
    "exerciceContentId" TEXT NOT NULL,
    "defaultRepetitionCount" INTEGER,
    "defaultSets" INTEGER,

    CONSTRAINT "ProgramExerciceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceContent_name_key" ON "ExerciceContent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceStep_exerciceContentId_order_key" ON "ExerciceStep"("exerciceContentId", "order");

-- AddForeignKey
ALTER TABLE "ExerciceSession" ADD CONSTRAINT "ExerciceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceStep" ADD CONSTRAINT "ExerciceStep_exerciceContentId_fkey" FOREIGN KEY ("exerciceContentId") REFERENCES "ExerciceContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceSerie" ADD CONSTRAINT "ExerciceSerie_exerciceSessionId_fkey" FOREIGN KEY ("exerciceSessionId") REFERENCES "ExerciceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceSerie" ADD CONSTRAINT "ExerciceSerie_exerciceContentId_fkey" FOREIGN KEY ("exerciceContentId") REFERENCES "ExerciceContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExerciceItem" ADD CONSTRAINT "ProgramExerciceItem_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExerciceItem" ADD CONSTRAINT "ProgramExerciceItem_exerciceContentId_fkey" FOREIGN KEY ("exerciceContentId") REFERENCES "ExerciceContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
