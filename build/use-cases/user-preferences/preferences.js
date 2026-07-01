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

// src/use-cases/user-preferences/preferences.ts
var preferences_exports = {};
__export(preferences_exports, {
  DEFAULT_PREFERENCES: () => DEFAULT_PREFERENCES,
  LENGTH_UNITS: () => LENGTH_UNITS,
  THEMES: () => THEMES,
  WEIGHT_UNITS: () => WEIGHT_UNITS,
  resolvePreferences: () => resolvePreferences
});
module.exports = __toCommonJS(preferences_exports);
var WEIGHT_UNITS = ["kg", "lb"];
var THEMES = ["dark", "light"];
var LENGTH_UNITS = ["meters", "inches"];
var DEFAULT_PREFERENCES = {
  weightUnit: "kg",
  theme: "light",
  lengthUnit: "meters",
  weeklyTrainingCount: null
};
function resolvePreferences(stored) {
  const value = stored ?? {};
  return {
    weightUnit: WEIGHT_UNITS.includes(value.weightUnit) ? value.weightUnit : DEFAULT_PREFERENCES.weightUnit,
    theme: THEMES.includes(value.theme) ? value.theme : DEFAULT_PREFERENCES.theme,
    lengthUnit: LENGTH_UNITS.includes(value.lengthUnit) ? value.lengthUnit : DEFAULT_PREFERENCES.lengthUnit,
    weeklyTrainingCount: typeof value.weeklyTrainingCount === "number" ? value.weeklyTrainingCount : DEFAULT_PREFERENCES.weeklyTrainingCount
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_PREFERENCES,
  LENGTH_UNITS,
  THEMES,
  WEIGHT_UNITS,
  resolvePreferences
});
