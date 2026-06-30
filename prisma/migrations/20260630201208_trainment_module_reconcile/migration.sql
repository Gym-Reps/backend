/*
  Warnings:

  - You are about to drop the column `name` on the `trainment_templates` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `trainments` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `trainments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `trainments` table. All the data in the column will be lost.
  - Added the required column `title` to the `trainment_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trainment_templates" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "trainments" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "finished_at" TIMESTAMP(3),
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
