-- AddForeignKey
ALTER TABLE "UserProgramExerciceItem" ADD CONSTRAINT "UserProgramExerciceItem_exerciceContentId_fkey" FOREIGN KEY ("exerciceContentId") REFERENCES "ExerciceContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
