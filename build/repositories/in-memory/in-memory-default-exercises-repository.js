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

// src/repositories/in-memory/in-memory-default-exercises-repository.ts
var in_memory_default_exercises_repository_exports = {};
__export(in_memory_default_exercises_repository_exports, {
  InMemoryDefaultExercisesRepository: () => InMemoryDefaultExercisesRepository
});
module.exports = __toCommonJS(in_memory_default_exercises_repository_exports);
var import_node_crypto = require("crypto");
var PAGE_SIZE = 20;
var InMemoryDefaultExercisesRepository = class {
  items = [];
  async findMany({ query, muscleGroup, page }) {
    const filtered = this.items.filter((item) => {
      if (query && !item.title.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (muscleGroup && item.muscle_group !== muscleGroup) {
        return false;
      }
      return true;
    });
    const exercises = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { exercises, total: filtered.length };
  }
  async findById(id) {
    return this.items.find((item) => item.id === id) ?? null;
  }
  async findBySlug(slug) {
    return this.items.find((item) => item.slug === slug) ?? null;
  }
  async create(data) {
    const exercise = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      title: data.title,
      slug: data.slug,
      muscle_group: data.muscle_group,
      image_path: data.image_path,
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : /* @__PURE__ */ new Date()
    };
    this.items.push(exercise);
    return exercise;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryDefaultExercisesRepository
});
