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

// src/http/controllers/trainment-templates/trainment-template-presenter.ts
var trainment_template_presenter_exports = {};
__export(trainment_template_presenter_exports, {
  trainmentTemplateToHTTP: () => trainmentTemplateToHTTP
});
module.exports = __toCommonJS(trainment_template_presenter_exports);
function trainmentTemplateToHTTP(template) {
  return {
    id: template.id,
    title: template.title,
    createdAt: template.created_at,
    updatedAt: template.updated_at
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trainmentTemplateToHTTP
});
