/*
  Warnings:

  - You are about to drop the column `designSpec` on the `CodeFragment` table. All the data in the column will be lost.
  - You are about to drop the column `inputImageUrl` on the `CodeFragment` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodeFragment" DROP COLUMN "designSpec",
DROP COLUMN "inputImageUrl";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "imageUrl";
