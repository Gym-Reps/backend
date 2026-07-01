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

// src/repositories/in-memory/in-memory-user-preferences-repository.ts
var in_memory_user_preferences_repository_exports = {};
__export(in_memory_user_preferences_repository_exports, {
  InMemoryUserPreferencesRepository: () => InMemoryUserPreferencesRepository
});
module.exports = __toCommonJS(in_memory_user_preferences_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryUserPreferencesRepository = class {
  items = [];
  async create(data) {
    const preferences = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      user_id: data.user_id,
      preferences: data.preferences ?? {},
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : /* @__PURE__ */ new Date()
    };
    this.items.push(preferences);
    return preferences;
  }
  async findByUserId(userId) {
    return this.items.find((item) => item.user_id === userId) ?? null;
  }
  async save(preferences) {
    const index = this.items.findIndex((item) => item.id === preferences.id);
    if (index >= 0) {
      this.items[index] = { ...preferences, updated_at: /* @__PURE__ */ new Date() };
      return this.items[index];
    }
    return preferences;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryUserPreferencesRepository
});
