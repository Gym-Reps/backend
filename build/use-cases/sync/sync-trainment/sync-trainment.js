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

// src/use-cases/sync/sync-trainment/sync-trainment.ts
var sync_trainment_exports = {};
__export(sync_trainment_exports, {
  SyncTrainmentUseCase: () => SyncTrainmentUseCase
});
module.exports = __toCommonJS(sync_trainment_exports);

// src/use-cases/errors/invalid-set-index-error.ts
var InvalidSetIndexError = class extends Error {
  constructor() {
    super("Invalid set index");
  }
};

// src/use-cases/errors/not-allowed-error.ts
var NotAllowedError = class extends Error {
  constructor() {
    super("Not allowed");
  }
};

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/_types/planned-sets.ts
function plannedSetCount(plannedSets) {
  return Object.keys(plannedSets).length;
}

// src/use-cases/sync/sync-trainment/sync-trainment.ts
var SyncTrainmentUseCase = class {
  constructor(trainmentSyncRepository, trainmentTemplatesRepository, exerciseTemplatesRepository, eventQueue) {
    this.trainmentSyncRepository = trainmentSyncRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.eventQueue = eventQueue;
  }
  trainmentSyncRepository;
  trainmentTemplatesRepository;
  exerciseTemplatesRepository;
  eventQueue;
  async execute({
    userId,
    id,
    trainmentTemplateId,
    startedAt,
    finishedAt,
    exercises
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    for (const exercise of exercises) {
      const exerciseTemplate = await this.exerciseTemplatesRepository.findById(
        exercise.exerciseTemplateId
      );
      if (!exerciseTemplate) {
        throw new ResourceNotFoundError();
      }
      if (exerciseTemplate.trainment_template_id !== trainmentTemplateId) {
        throw new NotAllowedError();
      }
      this.assertSetInvariant(exercise);
    }
    const result = await this.trainmentSyncRepository.persistTrainmentGraph({
      id,
      trainmentTemplateId,
      userId,
      startedAt,
      finishedAt,
      exercises
    });
    try {
      await this.eventQueue.add({
        eventId: result.eventId,
        eventType: "COMPUTE_TRAINMENT_METRICS",
        metadata: { trainmentId: id }
      });
    } catch (err) {
      console.error("[events] failed to enqueue sync job, sweeper will retry", err);
    }
    return result;
  }
  /**
   * Re-asserts the invariant Zod also enforces at the edge: exactly one set per
   * planned index, with contiguous 1..N indices. Defensive — guards the use-case
   * when invoked outside the HTTP layer (e.g. unit tests, future batch sync).
   */
  assertSetInvariant(exercise) {
    const indices = exercise.sets.map((set) => set.index).sort((a, b) => a - b);
    const contiguous = indices.every((value, position) => value === position + 1);
    if (exercise.sets.length !== plannedSetCount(exercise.plannedSets) || !contiguous) {
      throw new InvalidSetIndexError();
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SyncTrainmentUseCase
});
