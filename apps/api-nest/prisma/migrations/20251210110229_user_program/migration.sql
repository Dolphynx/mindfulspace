-- CreateTable
CREATE TABLE "UserProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgramDay" (
    "id" TEXT NOT NULL,
    "userProgramId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weekday" INTEGER,

    CONSTRAINT "UserProgramDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgramExerciceItem" (
    "id" TEXT NOT NULL,
    "userProgramDayId" TEXT NOT NULL,
    "exerciceContentId" TEXT NOT NULL,
    "defaultRepetitionCount" INTEGER,
    "defaultSets" INTEGER,

    CONSTRAINT "UserProgramExerciceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramDay" ADD CONSTRAINT "UserProgramDay_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgramExerciceItem" ADD CONSTRAINT "UserProgramExerciceItem_userProgramDayId_fkey" FOREIGN KEY ("userProgramDayId") REFERENCES "UserProgramDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
