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

// src/repositories/in-memory/in-memory-trainment-templates-repository.ts
var in_memory_trainment_templates_repository_exports = {};
__export(in_memory_trainment_templates_repository_exports, {
  InMemoryTrainmentTemplatesRepository: () => InMemoryTrainmentTemplatesRepository
});
module.exports = __toCommonJS(in_memory_trainment_templates_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryTrainmentTemplatesRepository = class {
  items = [];
  async create(data) {
    const template = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      user_id: data.user_id,
      title: data.title,
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : /* @__PURE__ */ new Date(),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null
    };
    this.items.push(template);
    return template;
  }
  async findById(id) {
    return this.items.find(
      (item) => item.id === id && item.deleted_at === null
    ) ?? null;
  }
  async findManyByUserId(userId) {
    return this.items.filter(
      (item) => item.user_id === userId && item.deleted_at === null
    );
  }
  async save(template) {
    const index = this.items.findIndex((item) => item.id === template.id);
    if (index >= 0) {
      this.items[index] = template;
    }
    return template;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryTrainmentTemplatesRepository
});
