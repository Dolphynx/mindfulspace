-- CreateTable
CREATE TABLE "ExerciceStep" (
    "id" TEXT NOT NULL,
    "exerciceTypeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "ExerciceStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceStep_exerciceTypeId_order_key" ON "ExerciceStep"("exerciceTypeId", "order");

-- AddForeignKey
ALTER TABLE "ExerciceStep" ADD CONSTRAINT "ExerciceStep_exerciceTypeId_fkey" FOREIGN KEY ("exerciceTypeId") REFERENCES "ExerciceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
