-- DropForeignKey
ALTER TABLE "public"."UserProgramDay" DROP CONSTRAINT "UserProgramDay_userProgramId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProgramExerciceItem" DROP CONSTRAINT "UserProgramExerciceItem_userProgramDayId_fkey";

-- AddForeignKey
ALTER TABLE "UserProgramDay" ADD CONSTRAINT "UserProgramDay_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramExerciceItem" ADD CONSTRAINT "UserProgramExerciceItem_userProgramDayId_fkey" FOREIGN KEY ("userProgramDayId") REFERENCES "UserProgramDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
