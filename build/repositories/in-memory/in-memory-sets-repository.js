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

// src/repositories/in-memory/in-memory-sets-repository.ts
var in_memory_sets_repository_exports = {};
__export(in_memory_sets_repository_exports, {
  InMemorySetsRepository: () => InMemorySetsRepository
});
module.exports = __toCommonJS(in_memory_sets_repository_exports);
var import_node_crypto = require("crypto");
var InMemorySetsRepository = class {
  items = [];
  async createMany(data) {
    const created = data.map((item) => {
      const set = {
        id: item.id ?? (0, import_node_crypto.randomUUID)(),
        trainment_id: item.trainment_id,
        exercise_id: item.exercise_id,
        user_id: item.user_id,
        index: item.index,
        weight: item.weight ?? null,
        repetitions: item.repetitions ?? null,
        performed_at: item.performed_at ? new Date(item.performed_at) : /* @__PURE__ */ new Date()
      };
      return set;
    });
    this.items.push(...created);
    return created;
  }
  async findById(id) {
    return this.items.find((item) => item.id === id) ?? null;
  }
  async findManyByExerciseId(exerciseId) {
    return this.items.filter((item) => item.exercise_id === exerciseId).sort((a, b) => a.index - b.index);
  }
  async findManyByTrainmentId(trainmentId) {
    return this.items.filter((item) => item.trainment_id === trainmentId).sort((a, b) => a.index - b.index);
  }
  async countByExerciseId(exerciseId) {
    return this.items.filter((item) => item.exercise_id === exerciseId).length;
  }
  async save(set) {
    const index = this.items.findIndex((item) => item.id === set.id);
    if (index >= 0) {
      this.items[index] = set;
    }
    return set;
  }
  async delete(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }
  async deleteManyByExerciseId(exerciseId) {
    this.items = this.items.filter((item) => item.exercise_id !== exerciseId);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemorySetsRepository
});
