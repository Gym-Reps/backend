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

// src/repositories/in-memory/in-memory-metrics-repository.ts
var in_memory_metrics_repository_exports = {};
__export(in_memory_metrics_repository_exports, {
  InMemoryMetricsRepository: () => InMemoryMetricsRepository
});
module.exports = __toCommonJS(in_memory_metrics_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryMetricsRepository = class {
  items = [];
  async upsertByCurrentSetId(data) {
    const existing = this.items.find(
      (item) => item.current_set_id === data.current_set_id
    );
    if (existing) {
      existing.user_id = data.user_id;
      existing.trainment_id = data.trainment_id;
      existing.exercise_id = data.exercise_id;
      existing.previous_set_id = data.previous_set_id;
      existing.weight_diff = data.weight_diff;
      existing.repetitions_diff = data.repetitions_diff;
      return existing;
    }
    const metric = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      user_id: data.user_id,
      trainment_id: data.trainment_id,
      exercise_id: data.exercise_id,
      previous_set_id: data.previous_set_id,
      current_set_id: data.current_set_id,
      weight_diff: data.weight_diff,
      repetitions_diff: data.repetitions_diff,
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date()
    };
    this.items.push(metric);
    return metric;
  }
  async findManyByTrainmentId(trainmentId) {
    return this.items.filter((item) => item.trainment_id === trainmentId);
  }
  async findManyByExerciseId(exerciseId) {
    return this.items.filter((item) => item.exercise_id === exerciseId);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryMetricsRepository
});
