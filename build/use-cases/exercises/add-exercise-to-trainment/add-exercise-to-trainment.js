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

// src/use-cases/exercises/add-exercise-to-trainment/add-exercise-to-trainment.ts
var add_exercise_to_trainment_exports = {};
__export(add_exercise_to_trainment_exports, {
  AddExerciseToTrainmentUseCase: () => AddExerciseToTrainmentUseCase
});
module.exports = __toCommonJS(add_exercise_to_trainment_exports);

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

// src/use-cases/exercises/add-exercise-to-trainment/add-exercise-to-trainment.ts
var AddExerciseToTrainmentUseCase = class {
  constructor(exercisesRepository, trainmentsRepository, exerciseTemplatesRepository, trainmentTemplatesRepository, createSetsForExerciseUseCase) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
    this.createSetsForExerciseUseCase = createSetsForExerciseUseCase;
  }
  exercisesRepository;
  trainmentsRepository;
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  createSetsForExerciseUseCase;
  async execute({
    userId,
    trainmentId,
    exerciseTemplateId,
    plannedSets
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exerciseTemplate = await this.exerciseTemplatesRepository.findById(exerciseTemplateId);
    if (!exerciseTemplate) {
      throw new ResourceNotFoundError();
    }
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(
      exerciseTemplate.trainment_template_id
    );
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exercise = await this.exercisesRepository.create({
      trainment_id: trainmentId,
      exercise_template_id: exerciseTemplateId,
      planned_sets: plannedSets
    });
    const { sets } = await this.createSetsForExerciseUseCase.execute({
      userId,
      trainmentId,
      exerciseId: exercise.id,
      plannedSets
    });
    return { exercise, sets };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddExerciseToTrainmentUseCase
});
