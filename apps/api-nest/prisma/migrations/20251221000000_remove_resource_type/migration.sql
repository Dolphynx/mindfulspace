-- Drop the type column from Resource table (redundant with category system)
ALTER TABLE "Resource" DROP COLUMN "type";

-- Drop the ResourceType enum
DROP TYPE "ResourceType";
