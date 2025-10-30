-- CreateTable
CREATE TABLE "TestData" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metricValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestData_pkey" PRIMARY KEY ("id")
);
