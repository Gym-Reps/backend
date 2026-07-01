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

// src/use-cases/user-preferences/update-user-preferences/update-user-preferences.ts
var update_user_preferences_exports = {};
__export(update_user_preferences_exports, {
  UpdateUserPreferencesUseCase: () => UpdateUserPreferencesUseCase
});
module.exports = __toCommonJS(update_user_preferences_exports);

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/user-preferences/preferences.ts
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

// src/use-cases/user-preferences/update-user-preferences/update-user-preferences.ts
var UpdateUserPreferencesUseCase = class {
  constructor(userPreferencesRepository) {
    this.userPreferencesRepository = userPreferencesRepository;
  }
  userPreferencesRepository;
  async execute({
    userId,
    data
  }) {
    const existing = await this.userPreferencesRepository.findByUserId(userId);
    if (!existing) {
      throw new ResourceNotFoundError();
    }
    const merged = resolvePreferences(
      existing.preferences
    );
    if (data.weightUnit !== void 0) merged.weightUnit = data.weightUnit;
    if (data.theme !== void 0) merged.theme = data.theme;
    if (data.lengthUnit !== void 0) merged.lengthUnit = data.lengthUnit;
    if (data.weeklyTrainingCount !== void 0) {
      merged.weeklyTrainingCount = data.weeklyTrainingCount;
    }
    existing.preferences = merged;
    const userPreferences = await this.userPreferencesRepository.save(existing);
    return { userPreferences };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdateUserPreferencesUseCase
});
