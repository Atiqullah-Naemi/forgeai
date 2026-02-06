-- AlterTable
ALTER TABLE "CodeFragment" ADD COLUMN     "designSpec" JSONB,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "imageUrl" TEXT;
