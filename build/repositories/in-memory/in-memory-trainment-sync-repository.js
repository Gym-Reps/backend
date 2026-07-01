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

// src/repositories/in-memory/in-memory-trainment-sync-repository.ts
var in_memory_trainment_sync_repository_exports = {};
__export(in_memory_trainment_sync_repository_exports, {
  InMemoryTrainmentSyncRepository: () => InMemoryTrainmentSyncRepository
});
module.exports = __toCommonJS(in_memory_trainment_sync_repository_exports);
var import_node_crypto = require("crypto");

// src/use-cases/errors/sync-conflict-error.ts
var SyncConflictError = class extends Error {
  constructor() {
    super("Sync conflict");
  }
};

// src/repositories/in-memory/in-memory-trainment-sync-repository.ts
var InMemoryTrainmentSyncRepository = class {
  trainments = [];
  exercises = [];
  sets = [];
  events = [];
  async persistTrainmentGraph(graph) {
    const existingTrainment = this.trainments.find((t) => t.id === graph.id);
    if (existingTrainment && existingTrainment.user_id !== graph.userId) {
      throw new SyncConflictError();
    }
    for (const exercise of graph.exercises) {
      for (const set of exercise.sets) {
        const existingSet = this.sets.find((s) => s.id === set.id);
        if (existingSet && existingSet.exercise_id !== exercise.id) {
          throw new SyncConflictError();
        }
      }
    }
    const created = !existingTrainment;
    const trainment = {
      id: graph.id,
      trainment_template_id: graph.trainmentTemplateId,
      user_id: graph.userId,
      started_at: graph.startedAt,
      finished_at: graph.finishedAt
    };
    this.upsertTrainment(trainment);
    const persistedExercises = [];
    const persistedSets = [];
    for (const exerciseInput of graph.exercises) {
      const previous = this.exercises.find((e) => e.id === exerciseInput.id);
      const exercise = {
        id: exerciseInput.id,
        exercise_template_id: exerciseInput.exerciseTemplateId,
        trainment_id: graph.id,
        planned_sets: exerciseInput.plannedSets,
        created_at: previous?.created_at ?? /* @__PURE__ */ new Date()
      };
      this.upsertExercise(exercise);
      persistedExercises.push(exercise);
      for (const setInput of exerciseInput.sets) {
        const set = {
          id: setInput.id,
          trainment_id: graph.id,
          exercise_id: exerciseInput.id,
          user_id: graph.userId,
          // forced from the caller, never the payload
          index: setInput.index,
          weight: setInput.weight,
          repetitions: setInput.repetitions,
          performed_at: setInput.performedAt
        };
        this.upsertSet(set);
        persistedSets.push(set);
      }
    }
    const now = /* @__PURE__ */ new Date();
    const event = {
      id: (0, import_node_crypto.randomUUID)(),
      event_type: "COMPUTE_TRAINMENT_METRICS",
      status: "PENDING",
      user_id: graph.userId,
      metadata: { trainmentId: graph.id },
      attempts: 0,
      last_error: null,
      created_at: now,
      updated_at: now,
      processed_at: null
    };
    this.events.push(event);
    return {
      trainment,
      exercises: persistedExercises,
      sets: persistedSets,
      created,
      eventId: event.id
    };
  }
  upsertTrainment(trainment) {
    const index = this.trainments.findIndex((t) => t.id === trainment.id);
    if (index >= 0) {
      this.trainments[index] = trainment;
    } else {
      this.trainments.push(trainment);
    }
  }
  upsertExercise(exercise) {
    const index = this.exercises.findIndex((e) => e.id === exercise.id);
    if (index >= 0) {
      this.exercises[index] = exercise;
    } else {
      this.exercises.push(exercise);
    }
  }
  upsertSet(set) {
    const index = this.sets.findIndex((s) => s.id === set.id);
    if (index >= 0) {
      this.sets[index] = set;
    } else {
      this.sets.push(set);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryTrainmentSyncRepository
});
