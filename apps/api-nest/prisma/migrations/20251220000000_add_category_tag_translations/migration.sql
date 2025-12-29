-- AlterTable ResourceCategory: Add new columns with defaults
ALTER TABLE "ResourceCategory"
  ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'fr',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable ResourceTag: Add new columns with defaults
ALTER TABLE "ResourceTag"
  ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'fr',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable ResourceCategoryTranslation
CREATE TABLE "ResourceCategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceCategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable ResourceTagTranslation
CREATE TABLE "ResourceTagTranslation" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceTagTranslation_pkey" PRIMARY KEY ("id")
);

-- Migrate existing category names to translations (French locale)
INSERT INTO "ResourceCategoryTranslation" ("id", "categoryId", "locale", "name", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  "id",
  'fr',
  "name",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ResourceCategory"
WHERE "name" IS NOT NULL;

-- Migrate existing tag names to translations (French locale)
INSERT INTO "ResourceTagTranslation" ("id", "tagId", "locale", "name", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  "id",
  'fr',
  "name",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ResourceTag"
WHERE "name" IS NOT NULL;

-- Drop old name columns
ALTER TABLE "ResourceCategory" DROP COLUMN "name";
ALTER TABLE "ResourceTag" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "ResourceCategory_sourceLocale_idx" ON "ResourceCategory"("sourceLocale");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategoryTranslation_categoryId_locale_key" ON "ResourceCategoryTranslation"("categoryId", "locale");

-- CreateIndex
CREATE INDEX "ResourceCategoryTranslation_locale_idx" ON "ResourceCategoryTranslation"("locale");

-- CreateIndex
CREATE INDEX "ResourceCategoryTranslation_name_idx" ON "ResourceCategoryTranslation"("name");

-- CreateIndex
CREATE INDEX "ResourceTag_sourceLocale_idx" ON "ResourceTag"("sourceLocale");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceTagTranslation_tagId_locale_key" ON "ResourceTagTranslation"("tagId", "locale");

-- CreateIndex
CREATE INDEX "ResourceTagTranslation_locale_idx" ON "ResourceTagTranslation"("locale");

-- CreateIndex
CREATE INDEX "ResourceTagTranslation_name_idx" ON "ResourceTagTranslation"("name");

-- AddForeignKey
ALTER TABLE "ResourceCategoryTranslation" ADD CONSTRAINT "ResourceCategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResourceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTagTranslation" ADD CONSTRAINT "ResourceTagTranslation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ResourceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
