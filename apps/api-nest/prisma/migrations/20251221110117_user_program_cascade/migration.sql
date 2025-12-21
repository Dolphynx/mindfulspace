-- DropForeignKey
ALTER TABLE "public"."UserProgramDayTranslation" DROP CONSTRAINT "UserProgramDayTranslation_userProgramDayId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProgramTranslation" DROP CONSTRAINT "UserProgramTranslation_userProgramId_fkey";

-- AddForeignKey
ALTER TABLE "UserProgramTranslation" ADD CONSTRAINT "UserProgramTranslation_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramDayTranslation" ADD CONSTRAINT "UserProgramDayTranslation_userProgramDayId_fkey" FOREIGN KEY ("userProgramDayId") REFERENCES "UserProgramDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
