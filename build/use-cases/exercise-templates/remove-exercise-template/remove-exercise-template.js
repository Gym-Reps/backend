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

// src/use-cases/exercise-templates/remove-exercise-template/remove-exercise-template.ts
var remove_exercise_template_exports = {};
__export(remove_exercise_template_exports, {
  RemoveExerciseTemplateUseCase: () => RemoveExerciseTemplateUseCase
});
module.exports = __toCommonJS(remove_exercise_template_exports);

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

// src/use-cases/exercise-templates/remove-exercise-template/remove-exercise-template.ts
var RemoveExerciseTemplateUseCase = class {
  constructor(exerciseTemplatesRepository, trainmentTemplatesRepository) {
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  async execute({
    userId,
    exerciseTemplateId
  }) {
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
    exerciseTemplate.deleted_at = /* @__PURE__ */ new Date();
    await this.exerciseTemplatesRepository.save(exerciseTemplate);
    trainmentTemplate.updated_at = /* @__PURE__ */ new Date();
    await this.trainmentTemplatesRepository.save(trainmentTemplate);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RemoveExerciseTemplateUseCase
});
