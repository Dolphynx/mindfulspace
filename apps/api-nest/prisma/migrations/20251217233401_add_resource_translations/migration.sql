-- CreateTable: ResourceTranslation
CREATE TABLE "ResourceTranslation" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceTranslation_pkey" PRIMARY KEY ("id")
);

-- Add sourceLocale to Resource (with default 'fr')
ALTER TABLE "Resource" ADD COLUMN "sourceLocale" TEXT NOT NULL DEFAULT 'fr';

-- Migrate existing data: Create French translations for all existing resources
INSERT INTO "ResourceTranslation" ("id", "resourceId", "locale", "title", "summary", "content", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    "id",
    'fr',
    "title",
    "summary",
    "content",
    "createdAt",
    "updatedAt"
FROM "Resource";

-- Drop old columns from Resource (after data is safely migrated)
ALTER TABLE "Resource" DROP COLUMN "title";
ALTER TABLE "Resource" DROP COLUMN "summary";
ALTER TABLE "Resource" DROP COLUMN "content";

-- Drop old indexes that referenced dropped columns
DROP INDEX IF EXISTS "Resource_title_idx";
DROP INDEX IF EXISTS "Resource_summary_idx";

-- Create new indexes
CREATE INDEX "Resource_slug_idx" ON "Resource"("slug");
CREATE INDEX "Resource_sourceLocale_idx" ON "Resource"("sourceLocale");

CREATE UNIQUE INDEX "ResourceTranslation_resourceId_locale_key" ON "ResourceTranslation"("resourceId", "locale");
CREATE INDEX "ResourceTranslation_locale_idx" ON "ResourceTranslation"("locale");
CREATE INDEX "ResourceTranslation_title_idx" ON "ResourceTranslation"("title");

-- AddForeignKey
ALTER TABLE "ResourceTranslation" ADD CONSTRAINT "ResourceTranslation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
