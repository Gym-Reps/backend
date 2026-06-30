-- DropForeignKey
ALTER TABLE "sets" DROP CONSTRAINT "sets_exerciseTemplateId_fkey";

-- AlterTable
ALTER TABLE "exercise_templates" DROP COLUMN "name",
DROP COLUMN "updated_at",
ADD COLUMN     "exercise_catalog_id" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "exercises" DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "planned_sets" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "sets" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "exerciseTemplateId",
DROP COLUMN "updated_at",
ADD COLUMN     "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "trainment_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "repetitions" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sets_exercise_id_index_key" ON "sets"("exercise_id", "index");

-- AddForeignKey
ALTER TABLE "exercise_templates" ADD CONSTRAINT "exercise_templates_exercise_catalog_id_fkey" FOREIGN KEY ("exercise_catalog_id") REFERENCES "default_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_trainment_id_fkey" FOREIGN KEY ("trainment_id") REFERENCES "trainments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

