/*
  Warnings:

  - The values [MEDITATION] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `MeditationSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MeditationMode" AS ENUM ('TIMER', 'AUDIO', 'VIDEO', 'VISUAL');

-- CreateEnum
CREATE TYPE "MeditationSessionSource" AS ENUM ('GUIDED', 'MANUAL', 'QUICK_TIMER');

-- CreateEnum
CREATE TYPE "MeditationVisualType" AS ENUM ('BREATHING_WAVE', 'LOTUS_OPENING', 'CIRCLE_PULSE');

-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('ARTICLE', 'VIDEO', 'MEDITATION_PROGRAM', 'WORKOUT_PROGRAM', 'GUIDE');
ALTER TABLE "Resource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "public"."ResourceType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."MeditationSession" DROP CONSTRAINT "MeditationSession_userId_fkey";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "meditationProgramId" TEXT;

-- DropTable
DROP TABLE "public"."MeditationSession";

-- CreateTable
CREATE TABLE "meditation_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "MeditationSessionSource" NOT NULL,
    "meditationTypeId" TEXT NOT NULL,
    "meditationContentId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL,
    "moodBefore" INTEGER,
    "moodAfter" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meditation_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meditation_type" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,

    CONSTRAINT "meditation_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meditation_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mode" "MeditationMode" NOT NULL,
    "defaultMeditationTypeId" TEXT NOT NULL,
    "defaultDurationSeconds" INTEGER,
    "minDurationSeconds" INTEGER,
    "maxDurationSeconds" INTEGER,
    "mediaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,

    CONSTRAINT "meditation_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meditation_visual_config" (
    "id" TEXT NOT NULL,
    "meditationContentId" TEXT NOT NULL,
    "visualType" "MeditationVisualType" NOT NULL,
    "configJson" JSONB NOT NULL,

    CONSTRAINT "meditation_visual_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meditation_program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,

    CONSTRAINT "meditation_program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meditation_program_item" (
    "id" TEXT NOT NULL,
    "meditationProgramId" TEXT NOT NULL,
    "meditationContentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "meditation_program_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meditation_session_userId_idx" ON "meditation_session"("userId");

-- CreateIndex
CREATE INDEX "meditation_session_meditationTypeId_idx" ON "meditation_session"("meditationTypeId");

-- CreateIndex
CREATE INDEX "meditation_session_meditationContentId_idx" ON "meditation_session"("meditationContentId");

-- CreateIndex
CREATE UNIQUE INDEX "meditation_type_slug_key" ON "meditation_type"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "meditation_visual_config_meditationContentId_key" ON "meditation_visual_config"("meditationContentId");

-- AddForeignKey
ALTER TABLE "meditation_session" ADD CONSTRAINT "meditation_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_session" ADD CONSTRAINT "meditation_session_meditationTypeId_fkey" FOREIGN KEY ("meditationTypeId") REFERENCES "meditation_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_session" ADD CONSTRAINT "meditation_session_meditationContentId_fkey" FOREIGN KEY ("meditationContentId") REFERENCES "meditation_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_content" ADD CONSTRAINT "meditation_content_defaultMeditationTypeId_fkey" FOREIGN KEY ("defaultMeditationTypeId") REFERENCES "meditation_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_visual_config" ADD CONSTRAINT "meditation_visual_config_meditationContentId_fkey" FOREIGN KEY ("meditationContentId") REFERENCES "meditation_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_program_item" ADD CONSTRAINT "meditation_program_item_meditationProgramId_fkey" FOREIGN KEY ("meditationProgramId") REFERENCES "meditation_program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meditation_program_item" ADD CONSTRAINT "meditation_program_item_meditationContentId_fkey" FOREIGN KEY ("meditationContentId") REFERENCES "meditation_content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_meditationProgramId_fkey" FOREIGN KEY ("meditationProgramId") REFERENCES "meditation_program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
