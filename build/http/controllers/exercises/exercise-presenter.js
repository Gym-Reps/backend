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

// src/http/controllers/exercises/exercise-presenter.ts
var exercise_presenter_exports = {};
__export(exercise_presenter_exports, {
  exerciseToHTTP: () => exerciseToHTTP
});
module.exports = __toCommonJS(exercise_presenter_exports);
function exerciseToHTTP(exercise) {
  return {
    id: exercise.id,
    trainmentId: exercise.trainment_id,
    exerciseTemplateId: exercise.exercise_template_id,
    plannedSets: exercise.planned_sets,
    createdAt: exercise.created_at
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  exerciseToHTTP
});
