/*
  Warnings:

  - You are about to drop the column `description` on the `meditation_type` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `meditation_type` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meditation_type" DROP COLUMN "description",
DROP COLUMN "name";
