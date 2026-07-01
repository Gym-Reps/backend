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

// src/use-cases/exercises/remove-exercise-from-trainment/remove-exercise-from-trainment.ts
var remove_exercise_from_trainment_exports = {};
__export(remove_exercise_from_trainment_exports, {
  RemoveExerciseFromTrainmentUseCase: () => RemoveExerciseFromTrainmentUseCase
});
module.exports = __toCommonJS(remove_exercise_from_trainment_exports);

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

// src/use-cases/exercises/remove-exercise-from-trainment/remove-exercise-from-trainment.ts
var RemoveExerciseFromTrainmentUseCase = class {
  constructor(exercisesRepository, trainmentsRepository, setsRepository) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
    this.setsRepository = setsRepository;
  }
  exercisesRepository;
  trainmentsRepository;
  setsRepository;
  async execute({
    userId,
    exerciseId
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
    await this.setsRepository.deleteManyByExerciseId(exerciseId);
    await this.exercisesRepository.delete(exerciseId);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RemoveExerciseFromTrainmentUseCase
});
