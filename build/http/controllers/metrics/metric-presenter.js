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

// src/http/controllers/metrics/metric-presenter.ts
var metric_presenter_exports = {};
__export(metric_presenter_exports, {
  metricToHTTP: () => metricToHTTP
});
module.exports = __toCommonJS(metric_presenter_exports);
function metricToHTTP(metric) {
  return {
    id: metric.id,
    trainmentId: metric.trainment_id,
    exerciseId: metric.exercise_id,
    previousSetId: metric.previous_set_id,
    currentSetId: metric.current_set_id,
    weightDiff: metric.weight_diff,
    repetitionsDiff: metric.repetitions_diff
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  metricToHTTP
});
