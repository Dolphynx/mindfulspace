-- DropForeignKey
ALTER TABLE "public"."ResourceTagOnResource" DROP CONSTRAINT "ResourceTagOnResource_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResourceTagOnResource" DROP CONSTRAINT "ResourceTagOnResource_tagId_fkey";

-- AddForeignKey
ALTER TABLE "ResourceTagOnResource" ADD CONSTRAINT "ResourceTagOnResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceTagOnResource" ADD CONSTRAINT "ResourceTagOnResource_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ResourceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
