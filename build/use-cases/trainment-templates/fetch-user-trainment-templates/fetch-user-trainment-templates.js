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

// src/use-cases/trainment-templates/fetch-user-trainment-templates/fetch-user-trainment-templates.ts
var fetch_user_trainment_templates_exports = {};
__export(fetch_user_trainment_templates_exports, {
  FetchUserTrainmentTemplatesUseCase: () => FetchUserTrainmentTemplatesUseCase
});
module.exports = __toCommonJS(fetch_user_trainment_templates_exports);
var FetchUserTrainmentTemplatesUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentTemplatesRepository;
  async execute({
    userId
  }) {
    const trainmentTemplates = await this.trainmentTemplatesRepository.findManyByUserId(userId);
    return { trainmentTemplates };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchUserTrainmentTemplatesUseCase
});
