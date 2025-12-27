-- CreateEnum
CREATE TYPE "SubscriptionRequestType" AS ENUM ('PREMIUM', 'COACH');

-- CreateEnum
CREATE TYPE "SubscriptionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CoachTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'PREMIUM');

-- CreateTable
CREATE TABLE "subscription_request" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "SubscriptionRequestType" NOT NULL,
    "status" "SubscriptionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "coachTier" "CoachTier",
    "motivation" TEXT,
    "experience" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscription_request_userId_idx" ON "subscription_request"("userId");

-- CreateIndex
CREATE INDEX "subscription_request_status_idx" ON "subscription_request"("status");

-- CreateIndex
CREATE INDEX "subscription_request_requestType_idx" ON "subscription_request"("requestType");

-- CreateIndex
CREATE INDEX "subscription_request_isRead_idx" ON "subscription_request"("isRead");

-- AddForeignKey
ALTER TABLE "subscription_request" ADD CONSTRAINT "subscription_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request" ADD CONSTRAINT "subscription_request_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
