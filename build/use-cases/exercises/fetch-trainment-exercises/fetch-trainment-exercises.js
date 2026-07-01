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

// src/use-cases/exercises/fetch-trainment-exercises/fetch-trainment-exercises.ts
var fetch_trainment_exercises_exports = {};
__export(fetch_trainment_exercises_exports, {
  FetchTrainmentExercisesUseCase: () => FetchTrainmentExercisesUseCase
});
module.exports = __toCommonJS(fetch_trainment_exercises_exports);

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

// src/use-cases/exercises/fetch-trainment-exercises/fetch-trainment-exercises.ts
var FetchTrainmentExercisesUseCase = class {
  constructor(exercisesRepository, trainmentsRepository) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  exercisesRepository;
  trainmentsRepository;
  async execute({
    userId,
    trainmentId
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exercises = await this.exercisesRepository.findManyByTrainmentId(trainmentId);
    return { exercises };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchTrainmentExercisesUseCase
});
