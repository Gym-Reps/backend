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

// src/use-cases/trainments/get-weekly-progress/get-weekly-progress.ts
var get_weekly_progress_exports = {};
__export(get_weekly_progress_exports, {
  GetWeeklyProgressUseCase: () => GetWeeklyProgressUseCase
});
module.exports = __toCommonJS(get_weekly_progress_exports);

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

// src/use-cases/_utils/week-range.ts
function getWeekRange(reference = /* @__PURE__ */ new Date()) {
  const startOfDay = new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate()
    )
  );
  const dayOfWeek = startOfDay.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(startOfDay);
  weekStart.setUTCDate(startOfDay.getUTCDate() - daysSinceMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

// src/use-cases/trainments/get-weekly-progress/get-weekly-progress.ts
var GetWeeklyProgressUseCase = class {
  constructor(trainmentsRepository, userPreferencesRepository) {
    this.trainmentsRepository = trainmentsRepository;
    this.userPreferencesRepository = userPreferencesRepository;
  }
  trainmentsRepository;
  userPreferencesRepository;
  async execute({
    userId,
    reference
  }) {
    const { weekStart, weekEnd } = getWeekRange(reference);
    const trainments = await this.trainmentsRepository.findFinishedByUserIdInPeriod(
      userId,
      weekStart,
      weekEnd
    );
    const preferences = await this.userPreferencesRepository.findByUserId(userId);
    const goal = preferences ? resolvePreferences(preferences.preferences).weeklyTrainingCount : null;
    return {
      weekStart,
      weekEnd,
      completed: trainments.length,
      goal,
      trainments
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetWeeklyProgressUseCase
});
