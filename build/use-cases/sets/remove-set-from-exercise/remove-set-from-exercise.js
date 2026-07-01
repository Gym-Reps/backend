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

// src/use-cases/sets/remove-set-from-exercise/remove-set-from-exercise.ts
var remove_set_from_exercise_exports = {};
__export(remove_set_from_exercise_exports, {
  RemoveSetFromExerciseUseCase: () => RemoveSetFromExerciseUseCase
});
module.exports = __toCommonJS(remove_set_from_exercise_exports);

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
function asPlannedSets(value) {
  return value ?? {};
}
function plannedSetCount(plannedSets) {
  return Object.keys(plannedSets).length;
}

// src/use-cases/sets/remove-set-from-exercise/remove-set-from-exercise.ts
var RemoveSetFromExerciseUseCase = class {
  constructor(setsRepository, exercisesRepository) {
    this.setsRepository = setsRepository;
    this.exercisesRepository = exercisesRepository;
  }
  setsRepository;
  exercisesRepository;
  async execute({
    userId,
    setId
  }) {
    const set = await this.setsRepository.findById(setId);
    if (!set) {
      throw new ResourceNotFoundError();
    }
    if (set.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exercise = await this.exercisesRepository.findById(set.exercise_id);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const plannedSets = { ...asPlannedSets(exercise.planned_sets) };
    const lastIndex = plannedSetCount(plannedSets);
    if (set.index !== lastIndex) {
      throw new InvalidSetIndexError();
    }
    delete plannedSets[String(lastIndex)];
    exercise.planned_sets = plannedSets;
    await this.setsRepository.delete(set.id);
    await this.exercisesRepository.save(exercise);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RemoveSetFromExerciseUseCase
});
