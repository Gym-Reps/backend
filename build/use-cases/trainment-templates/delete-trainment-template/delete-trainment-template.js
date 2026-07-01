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

// src/use-cases/trainment-templates/delete-trainment-template/delete-trainment-template.ts
var delete_trainment_template_exports = {};
__export(delete_trainment_template_exports, {
  DeleteTrainmentTemplateUseCase: () => DeleteTrainmentTemplateUseCase
});
module.exports = __toCommonJS(delete_trainment_template_exports);

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

// src/use-cases/trainment-templates/delete-trainment-template/delete-trainment-template.ts
var DeleteTrainmentTemplateUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
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
    trainmentTemplate.deleted_at = /* @__PURE__ */ new Date();
    await this.trainmentTemplatesRepository.save(trainmentTemplate);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeleteTrainmentTemplateUseCase
});
