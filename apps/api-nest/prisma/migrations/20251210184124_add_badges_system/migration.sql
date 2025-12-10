-- CreateEnum
CREATE TYPE "BadgeDomain" AS ENUM ('GENERIC', 'MEDITATION', 'EXERCICE', 'SLEEP');

-- CreateEnum
CREATE TYPE "BadgeMetricType" AS ENUM ('TOTAL_MEDITATION_SESSIONS', 'MEDITATION_STREAK_DAYS', 'TOTAL_EXERCICE_SESSIONS', 'TOTAL_SLEEP_NIGHTS', 'TOTAL_SESSIONS_ANY');

-- CreateTable
CREATE TABLE "BadgeDefinition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" "BadgeDomain" NOT NULL,
    "metric" "BadgeMetricType" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "titleKey" TEXT NOT NULL,
    "descriptionKey" TEXT NOT NULL,
    "iconKey" TEXT,
    "highlightDurationHours" INTEGER,
    "sortOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metricValueAtEarn" INTEGER,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BadgeDefinition_slug_key" ON "BadgeDefinition"("slug");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "BadgeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
