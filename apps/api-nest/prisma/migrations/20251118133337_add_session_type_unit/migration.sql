/*
  Warnings:

  - You are about to drop the column `sessionUnitId` on the `SessionType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SessionType" DROP CONSTRAINT "SessionType_sessionUnitId_fkey";

-- AlterTable
ALTER TABLE "SessionType" DROP COLUMN "sessionUnitId";

-- CreateTable
CREATE TABLE "SessionTypeUnit" (
    "priority" INTEGER NOT NULL,
    "sessionTypeId" TEXT NOT NULL,
    "sessionUnitId" TEXT NOT NULL,

    CONSTRAINT "SessionTypeUnit_pkey" PRIMARY KEY ("sessionTypeId","sessionUnitId")
);

-- AddForeignKey
ALTER TABLE "SessionTypeUnit" ADD CONSTRAINT "SessionTypeUnit_sessionTypeId_fkey" FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTypeUnit" ADD CONSTRAINT "SessionTypeUnit_sessionUnitId_fkey" FOREIGN KEY ("sessionUnitId") REFERENCES "SessionUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
