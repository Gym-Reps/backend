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

// src/http/controllers/trainments/trainment-presenter.ts
var trainment_presenter_exports = {};
__export(trainment_presenter_exports, {
  trainmentToHTTP: () => trainmentToHTTP
});
module.exports = __toCommonJS(trainment_presenter_exports);
function trainmentToHTTP(trainment) {
  return {
    id: trainment.id,
    trainmentTemplateId: trainment.trainment_template_id,
    userId: trainment.user_id,
    startedAt: trainment.started_at,
    finishedAt: trainment.finished_at
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trainmentToHTTP
});
