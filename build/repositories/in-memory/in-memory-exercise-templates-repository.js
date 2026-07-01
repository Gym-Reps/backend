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

// src/repositories/in-memory/in-memory-exercise-templates-repository.ts
var in_memory_exercise_templates_repository_exports = {};
__export(in_memory_exercise_templates_repository_exports, {
  InMemoryExerciseTemplatesRepository: () => InMemoryExerciseTemplatesRepository
});
module.exports = __toCommonJS(in_memory_exercise_templates_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryExerciseTemplatesRepository = class {
  items = [];
  async create(data) {
    const exerciseTemplate = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      trainment_template_id: data.trainment_template_id,
      exercise_catalog_id: data.exercise_catalog_id,
      title: data.title,
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date(),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null
    };
    this.items.push(exerciseTemplate);
    return exerciseTemplate;
  }
  async findById(id) {
    return this.items.find(
      (item) => item.id === id && item.deleted_at === null
    ) ?? null;
  }
  async findManyByTemplateId(templateId) {
    return this.items.filter(
      (item) => item.trainment_template_id === templateId && item.deleted_at === null
    );
  }
  async save(exerciseTemplate) {
    const index = this.items.findIndex(
      (item) => item.id === exerciseTemplate.id
    );
    if (index >= 0) {
      this.items[index] = exerciseTemplate;
    }
    return exerciseTemplate;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryExerciseTemplatesRepository
});
