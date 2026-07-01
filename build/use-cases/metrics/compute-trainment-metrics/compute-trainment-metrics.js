"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/use-cases/metrics/compute-trainment-metrics/compute-trainment-metrics.ts
var compute_trainment_metrics_exports = {};
__export(compute_trainment_metrics_exports, {
  ComputeTrainmentMetricsUseCase: () => ComputeTrainmentMetricsUseCase
});
module.exports = __toCommonJS(compute_trainment_metrics_exports);
var ComputeTrainmentMetricsUseCase = class {
  constructor(trainmentsRepository, exercisesRepository, setsRepository, metricsRepository) {
    this.trainmentsRepository = trainmentsRepository;
    this.exercisesRepository = exercisesRepository;
    this.setsRepository = setsRepository;
    this.metricsRepository = metricsRepository;
  }
  trainmentsRepository;
  exercisesRepository;
  setsRepository;
  metricsRepository;
  /** EventHandler entrypoint: reads `trainmentId` from the event metadata. */
  async handle(event) {
    const { trainmentId } = event.metadata ?? {};
    if (!trainmentId) {
      return;
    }
    await this.execute({ trainmentId });
  }
  async execute({
    trainmentId
  }) {
    const current = await this.trainmentsRepository.findById(trainmentId);
    if (!current) {
      return { metrics: [] };
    }
    const previous = await this.trainmentsRepository.findPreviousSameTemplate({
      userId: current.user_id,
      trainmentTemplateId: current.trainment_template_id,
      before: current.started_at,
      excludeTrainmentId: current.id
    });
    if (!previous) {
      return { metrics: [] };
    }
    const currentExercises = await this.exercisesRepository.findManyByTrainmentId(current.id);
    const previousExercises = await this.exercisesRepository.findManyByTrainmentId(previous.id);
    const previousByTemplate = /* @__PURE__ */ new Map();
    for (const exercise of previousExercises) {
      if (!previousByTemplate.has(exercise.exercise_template_id)) {
        previousByTemplate.set(exercise.exercise_template_id, exercise);
      }
    }
    const metrics = [];
    for (const exercise of currentExercises) {
      const previousExercise = previousByTemplate.get(
        exercise.exercise_template_id
      );
      if (!previousExercise) {
        continue;
      }
      const currentSets = await this.setsRepository.findManyByExerciseId(
        exercise.id
      );
      const previousSets = await this.setsRepository.findManyByExerciseId(
        previousExercise.id
      );
      const previousByIndex = new Map(previousSets.map((set) => [set.index, set]));
      for (const set of currentSets) {
        const previousSet = previousByIndex.get(set.index);
        if (!previousSet) {
          continue;
        }
        if (set.weight === null || set.repetitions === null || previousSet.weight === null || previousSet.repetitions === null) {
          continue;
        }
        const metric = await this.metricsRepository.upsertByCurrentSetId({
          user_id: current.user_id,
          trainment_id: current.id,
          exercise_id: exercise.id,
          previous_set_id: previousSet.id,
          current_set_id: set.id,
          weight_diff: set.weight - previousSet.weight,
          repetitions_diff: set.repetitions - previousSet.repetitions
        });
        metrics.push(metric);
      }
    }
    return { metrics };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ComputeTrainmentMetricsUseCase
});
