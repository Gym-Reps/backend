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

// src/use-cases/trainments/start-trainment/start-trainment.ts
var start_trainment_exports = {};
__export(start_trainment_exports, {
  StartTrainmentUseCase: () => StartTrainmentUseCase
});
module.exports = __toCommonJS(start_trainment_exports);

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

// src/use-cases/trainments/start-trainment/start-trainment.ts
var StartTrainmentUseCase = class {
  constructor(trainmentsRepository, trainmentTemplatesRepository) {
    this.trainmentsRepository = trainmentsRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentsRepository;
  trainmentTemplatesRepository;
  async execute({
    userId,
    trainmentTemplateId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const trainment = await this.trainmentsRepository.create({
      trainment_template_id: trainmentTemplateId,
      user_id: userId
    });
    return { trainment };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StartTrainmentUseCase
});
