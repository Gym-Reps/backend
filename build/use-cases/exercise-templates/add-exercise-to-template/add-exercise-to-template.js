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

// src/use-cases/exercise-templates/add-exercise-to-template/add-exercise-to-template.ts
var add_exercise_to_template_exports = {};
__export(add_exercise_to_template_exports, {
  AddExerciseToTemplateUseCase: () => AddExerciseToTemplateUseCase
});
module.exports = __toCommonJS(add_exercise_to_template_exports);

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

// src/use-cases/exercise-templates/add-exercise-to-template/add-exercise-to-template.ts
var AddExerciseToTemplateUseCase = class {
  constructor(exerciseTemplatesRepository, trainmentTemplatesRepository, defaultExercisesRepository) {
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
    this.defaultExercisesRepository = defaultExercisesRepository;
  }
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  defaultExercisesRepository;
  async execute({
    userId,
    trainmentTemplateId,
    exerciseCatalogId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const catalogExercise = await this.defaultExercisesRepository.findById(exerciseCatalogId);
    if (!catalogExercise) {
      throw new ResourceNotFoundError();
    }
    const exerciseTemplate = await this.exerciseTemplatesRepository.create({
      trainment_template_id: trainmentTemplateId,
      exercise_catalog_id: exerciseCatalogId,
      // title is snapshotted from the catalog at add-time (no later drift).
      title: catalogExercise.title
    });
    trainmentTemplate.updated_at = /* @__PURE__ */ new Date();
    await this.trainmentTemplatesRepository.save(trainmentTemplate);
    return { exerciseTemplate };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddExerciseToTemplateUseCase
});
