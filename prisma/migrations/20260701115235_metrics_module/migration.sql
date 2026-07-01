-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trainment_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "previous_set_id" TEXT NOT NULL,
    "current_set_id" TEXT NOT NULL,
    "weight_diff" DOUBLE PRECISION NOT NULL,
    "repetitions_diff" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "metrics_current_set_id_key" ON "metrics"("current_set_id");

-- CreateIndex
CREATE INDEX "metrics_trainment_id_idx" ON "metrics"("trainment_id");

-- CreateIndex
CREATE INDEX "metrics_exercise_id_idx" ON "metrics"("exercise_id");

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_trainment_id_fkey" FOREIGN KEY ("trainment_id") REFERENCES "trainments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_previous_set_id_fkey" FOREIGN KEY ("previous_set_id") REFERENCES "sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_current_set_id_fkey" FOREIGN KEY ("current_set_id") REFERENCES "sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
