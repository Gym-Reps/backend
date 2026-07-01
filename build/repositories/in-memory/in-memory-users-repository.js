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

// src/repositories/in-memory/in-memory-users-repository.ts
var in_memory_users_repository_exports = {};
__export(in_memory_users_repository_exports, {
  InMemoryUsersRepository: () => InMemoryUsersRepository
});
module.exports = __toCommonJS(in_memory_users_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryUsersRepository = class {
  items = [];
  async create(data) {
    const user = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      username: data.username,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role ?? "MEMBER",
      created_at: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : /* @__PURE__ */ new Date(),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null
    };
    this.items.push(user);
    return user;
  }
  async findByEmail(email) {
    return this.items.find(
      (item) => item.email === email && item.deleted_at === null
    ) ?? null;
  }
  async findByUsername(username) {
    return this.items.find(
      (item) => item.username === username && item.deleted_at === null
    ) ?? null;
  }
  async findById(id) {
    return this.items.find(
      (item) => item.id === id && item.deleted_at === null
    ) ?? null;
  }
  async save(user) {
    const index = this.items.findIndex((item) => item.id === user.id);
    if (index >= 0) {
      this.items[index] = user;
    }
    return user;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryUsersRepository
});
