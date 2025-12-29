/*
  Warnings:

  - You are about to drop the column `soundcloudUrl` on the `meditation_content` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ExternalAudioProvider" AS ENUM ('AUDIUS', 'SOUNDCLOUD');

-- AlterTable
ALTER TABLE "meditation_content" DROP COLUMN "soundcloudUrl",
ADD COLUMN     "externalAudioProvider" "ExternalAudioProvider",
ADD COLUMN     "externalAudioRef" TEXT;
