-- CreateTable
CREATE TABLE "WorkoutProgram" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutProgramDay" (
    "id" TEXT NOT NULL,
    "workoutProgramId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "weekday" INTEGER,

    CONSTRAINT "WorkoutProgramDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutProgramExercice" (
    "id" TEXT NOT NULL,
    "programDayId" TEXT NOT NULL,
    "exerciceTypeId" TEXT NOT NULL,
    "defaultRepetitionCount" INTEGER,
    "defaultSets" INTEGER,

    CONSTRAINT "WorkoutProgramExercice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutProgramDay" ADD CONSTRAINT "WorkoutProgramDay_workoutProgramId_fkey" FOREIGN KEY ("workoutProgramId") REFERENCES "WorkoutProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutProgramExercice" ADD CONSTRAINT "WorkoutProgramExercice_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "WorkoutProgramDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutProgramExercice" ADD CONSTRAINT "WorkoutProgramExercice_exerciceTypeId_fkey" FOREIGN KEY ("exerciceTypeId") REFERENCES "ExerciceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
