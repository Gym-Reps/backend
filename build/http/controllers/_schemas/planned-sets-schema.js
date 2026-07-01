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

// src/http/controllers/_schemas/planned-sets-schema.ts
var planned_sets_schema_exports = {};
__export(planned_sets_schema_exports, {
  plannedSetsSchema: () => plannedSetsSchema
});
module.exports = __toCommonJS(planned_sets_schema_exports);
var import_zod = require("zod");
var plannedSetsSchema = import_zod.z.record(
  import_zod.z.string().regex(/^\d+$/),
  import_zod.z.object({
    weight: import_zod.z.number().nullable(),
    min_reps: import_zod.z.number().int().nullable(),
    max_reps: import_zod.z.number().int().nullable()
  })
).refine(
  (plannedSets) => {
    const indices = Object.keys(plannedSets).map(Number).sort((a, b) => a - b);
    return indices.length > 0 && indices.every((value, position) => value === position + 1);
  },
  { message: "planned_sets keys must be contiguous 1..N" }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  plannedSetsSchema
});
