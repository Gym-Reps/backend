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

// src/use-cases/sets/add-set-to-exercise/add-set-to-exercise.ts
var add_set_to_exercise_exports = {};
__export(add_set_to_exercise_exports, {
  AddSetToExerciseUseCase: () => AddSetToExerciseUseCase
});
module.exports = __toCommonJS(add_set_to_exercise_exports);

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

// src/use-cases/sets/add-set-to-exercise/add-set-to-exercise.ts
var AddSetToExerciseUseCase = class {
  constructor(setsRepository, exercisesRepository, trainmentsRepository) {
    this.setsRepository = setsRepository;
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  setsRepository;
  exercisesRepository;
  trainmentsRepository;
  async execute({
    userId,
    exerciseId,
    weight,
    minReps,
    maxReps
  }) {
    const exercise = await this.exercisesRepository.findById(exerciseId);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const trainment = await this.trainmentsRepository.findById(
      exercise.trainment_id
    );
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const plannedSets = { ...asPlannedSets(exercise.planned_sets) };
    const previousIndex = plannedSetCount(plannedSets);
    const newIndex = previousIndex + 1;
    const previous = plannedSets[String(previousIndex)];
    plannedSets[String(newIndex)] = {
      weight: weight ?? previous?.weight ?? null,
      min_reps: minReps ?? previous?.min_reps ?? null,
      max_reps: maxReps ?? previous?.max_reps ?? null
    };
    exercise.planned_sets = plannedSets;
    await this.exercisesRepository.save(exercise);
    const [set] = await this.setsRepository.createMany([
      {
        trainment_id: exercise.trainment_id,
        exercise_id: exerciseId,
        user_id: userId,
        index: newIndex,
        weight: null,
        repetitions: null
      }
    ]);
    return { set };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddSetToExerciseUseCase
});
