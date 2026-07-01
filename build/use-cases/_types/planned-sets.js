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

// src/use-cases/_types/planned-sets.ts
var planned_sets_exports = {};
__export(planned_sets_exports, {
  asPlannedSets: () => asPlannedSets,
  plannedSetCount: () => plannedSetCount,
  plannedSetIndices: () => plannedSetIndices
});
module.exports = __toCommonJS(planned_sets_exports);
function asPlannedSets(value) {
  return value ?? {};
}
function plannedSetIndices(plannedSets) {
  return Object.keys(plannedSets).map(Number).sort((a, b) => a - b);
}
function plannedSetCount(plannedSets) {
  return Object.keys(plannedSets).length;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  asPlannedSets,
  plannedSetCount,
  plannedSetIndices
});
