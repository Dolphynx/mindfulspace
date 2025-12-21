/*
  Warnings:

  - You are about to drop the column `Description` on the `ExerciceContent` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ExerciceContent` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ExerciceStep` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ExerciceStep` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ProgramDay` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `UserProgramDay` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserProgram" DROP CONSTRAINT "UserProgram_programId_fkey";

-- DropIndex
DROP INDEX "public"."ExerciceContent_name_key";

-- AlterTable
ALTER TABLE "ExerciceContent" DROP COLUMN "Description",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "ExerciceStep" DROP COLUMN "description",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "description",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "ProgramDay" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "UserProgram" ALTER COLUMN "programId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserProgramDay" DROP COLUMN "title";

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciceContentTranslation" (
    "id" TEXT NOT NULL,
    "exerciceContentId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ExerciceContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciceStepTranslation" (
    "id" TEXT NOT NULL,
    "exerciceStepId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "ExerciceStepTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramTranslation" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ProgramTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDayTranslation" (
    "id" TEXT NOT NULL,
    "programDayId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ProgramDayTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgramTranslation" (
    "id" TEXT NOT NULL,
    "userProgramId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UserProgramTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgramDayTranslation" (
    "id" TEXT NOT NULL,
    "userProgramDayId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "UserProgramDayTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceContentTranslation_exerciceContentId_languageCode_key" ON "ExerciceContentTranslation"("exerciceContentId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceStepTranslation_exerciceStepId_languageCode_key" ON "ExerciceStepTranslation"("exerciceStepId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramTranslation_programId_languageCode_key" ON "ProgramTranslation"("programId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramDayTranslation_programDayId_languageCode_key" ON "ProgramDayTranslation"("programDayId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgramTranslation_userProgramId_languageCode_key" ON "UserProgramTranslation"("userProgramId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgramDayTranslation_userProgramDayId_languageCode_key" ON "UserProgramDayTranslation"("userProgramDayId", "languageCode");

-- AddForeignKey
ALTER TABLE "ExerciceContentTranslation" ADD CONSTRAINT "ExerciceContentTranslation_exerciceContentId_fkey" FOREIGN KEY ("exerciceContentId") REFERENCES "ExerciceContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceContentTranslation" ADD CONSTRAINT "ExerciceContentTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceStepTranslation" ADD CONSTRAINT "ExerciceStepTranslation_exerciceStepId_fkey" FOREIGN KEY ("exerciceStepId") REFERENCES "ExerciceStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceStepTranslation" ADD CONSTRAINT "ExerciceStepTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTranslation" ADD CONSTRAINT "ProgramTranslation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTranslation" ADD CONSTRAINT "ProgramTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDayTranslation" ADD CONSTRAINT "ProgramDayTranslation_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDayTranslation" ADD CONSTRAINT "ProgramDayTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramTranslation" ADD CONSTRAINT "UserProgramTranslation_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramTranslation" ADD CONSTRAINT "UserProgramTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramDayTranslation" ADD CONSTRAINT "UserProgramDayTranslation_userProgramDayId_fkey" FOREIGN KEY ("userProgramDayId") REFERENCES "UserProgramDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramDayTranslation" ADD CONSTRAINT "UserProgramDayTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
