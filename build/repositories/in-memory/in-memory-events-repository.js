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

// src/repositories/in-memory/in-memory-events-repository.ts
var in_memory_events_repository_exports = {};
__export(in_memory_events_repository_exports, {
  InMemoryEventsRepository: () => InMemoryEventsRepository
});
module.exports = __toCommonJS(in_memory_events_repository_exports);
var import_node_crypto = require("crypto");
var InMemoryEventsRepository = class {
  items = [];
  async create(data) {
    const now = /* @__PURE__ */ new Date();
    const event = {
      id: data.id ?? (0, import_node_crypto.randomUUID)(),
      event_type: data.event_type,
      status: data.status ?? "PENDING",
      user_id: data.user_id,
      metadata: data.metadata ?? {},
      attempts: data.attempts ?? 0,
      last_error: data.last_error ?? null,
      created_at: now,
      updated_at: now,
      processed_at: null
    };
    this.items.push(event);
    return event;
  }
  async findById(id) {
    return this.items.find((event) => event.id === id) ?? null;
  }
  async markProcessing(id) {
    const event = this.items.find((item) => item.id === id);
    if (!event) return;
    event.status = "PROCESSING";
    event.updated_at = /* @__PURE__ */ new Date();
  }
  async markCompleted(id) {
    const event = this.items.find((item) => item.id === id);
    if (!event) return;
    event.status = "COMPLETED";
    event.processed_at = /* @__PURE__ */ new Date();
    event.updated_at = /* @__PURE__ */ new Date();
  }
  async markFailed(id, attempts, error) {
    const event = this.items.find((item) => item.id === id);
    if (!event) return;
    event.status = "FAILED";
    event.attempts = attempts;
    event.last_error = error;
    event.processed_at = /* @__PURE__ */ new Date();
    event.updated_at = /* @__PURE__ */ new Date();
  }
  async findStalePending(olderThan) {
    return this.items.filter(
      (event) => event.status === "PENDING" && event.created_at <= olderThan
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryEventsRepository
});
