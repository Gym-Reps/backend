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

// src/repositories/in-memory/in-memory-exercises-repository.ts
var in_memory_exercises_repository_exports = {};
__export(in_memory_exercises_repository_exports, {
  InMemoryExercisesRepository: () => InMemoryExercisesRepository
});
module.exports = __toCommonJS(in_memory_exercises_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryExercisesRepository = class {
  items = [];
  async create(data) {
    const exercise = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      exercise_template_id: data.exercise_template_id,
      trainment_id: data.trainment_id,
      planned_sets: data.planned_sets ?? {},
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date()
    };
    this.items.push(exercise);
    return exercise;
  }
  async findById(id) {
    return this.items.find((item) => item.id === id) ?? null;
  }
  async findManyByTrainmentId(trainmentId) {
    return this.items.filter((item) => item.trainment_id === trainmentId).sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }
  async save(exercise) {
    const index = this.items.findIndex((item) => item.id === exercise.id);
    if (index >= 0) {
      this.items[index] = exercise;
    }
    return exercise;
  }
  async delete(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryExercisesRepository
});
