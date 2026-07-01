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

// src/http/controllers/sets/set-presenter.ts
var set_presenter_exports = {};
__export(set_presenter_exports, {
  setToHTTP: () => setToHTTP
});
module.exports = __toCommonJS(set_presenter_exports);
function setToHTTP(set) {
  return {
    id: set.id,
    trainmentId: set.trainment_id,
    exerciseId: set.exercise_id,
    index: set.index,
    weight: set.weight,
    repetitions: set.repetitions,
    performedAt: set.performed_at
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setToHTTP
});
