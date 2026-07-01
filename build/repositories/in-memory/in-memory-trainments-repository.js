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

// src/repositories/in-memory/in-memory-trainments-repository.ts
var in_memory_trainments_repository_exports = {};
__export(in_memory_trainments_repository_exports, {
  InMemoryTrainmentsRepository: () => InMemoryTrainmentsRepository
});
module.exports = __toCommonJS(in_memory_trainments_repository_exports);
var import_node_crypto = require("crypto");
var PAGE_SIZE = 20;
var InMemoryTrainmentsRepository = class {
  items = [];
  async create(data) {
    const trainment = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      trainment_template_id: data.trainment_template_id,
      user_id: data.user_id,
      started_at: data.started_at ? new Date(data.started_at) : /* @__PURE__ */ new Date(),
      finished_at: data.finished_at ? new Date(data.finished_at) : null
    };
    this.items.push(trainment);
    return trainment;
  }
  async findById(id) {
    return this.items.find((item) => item.id === id) ?? null;
  }
  async findManyByUserId(userId, params) {
    return this.items.filter((item) => {
      if (item.user_id !== userId) {
        return false;
      }
      if (params.trainmentTemplateId && item.trainment_template_id !== params.trainmentTemplateId) {
        return false;
      }
      return true;
    }).sort((a, b) => b.started_at.getTime() - a.started_at.getTime()).slice((params.page - 1) * PAGE_SIZE, params.page * PAGE_SIZE);
  }
  async findFinishedByUserIdInPeriod(userId, start, end) {
    return this.items.filter(
      (item) => item.user_id === userId && item.finished_at !== null && item.finished_at >= start && item.finished_at <= end
    ).sort((a, b) => b.finished_at.getTime() - a.finished_at.getTime());
  }
  async findPreviousSameTemplate(params) {
    return this.items.filter(
      (item) => item.user_id === params.userId && item.trainment_template_id === params.trainmentTemplateId && item.id !== params.excludeTrainmentId && item.finished_at !== null && item.started_at.getTime() < params.before.getTime()
    ).sort((a, b) => b.started_at.getTime() - a.started_at.getTime())[0] ?? null;
  }
  async save(trainment) {
    const index = this.items.findIndex((item) => item.id === trainment.id);
    if (index >= 0) {
      this.items[index] = trainment;
    }
    return trainment;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryTrainmentsRepository
});
