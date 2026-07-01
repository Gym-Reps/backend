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

// src/use-cases/user-preferences/create-default-user-preferences/create-default-user-preferences.ts
var create_default_user_preferences_exports = {};
__export(create_default_user_preferences_exports, {
  CreateDefaultUserPreferencesUseCase: () => CreateDefaultUserPreferencesUseCase
});
module.exports = __toCommonJS(create_default_user_preferences_exports);

// src/use-cases/errors/user-preferences-already-exists-error.ts
var UserPreferencesAlreadyExistsError = class extends Error {
  constructor() {
    super("User preferences already exist");
  }
};

// src/use-cases/user-preferences/preferences.ts
var DEFAULT_PREFERENCES = {
  weightUnit: "kg",
  theme: "light",
  lengthUnit: "meters",
  weeklyTrainingCount: null
};

// src/use-cases/user-preferences/create-default-user-preferences/create-default-user-preferences.ts
var CreateDefaultUserPreferencesUseCase = class {
  constructor(userPreferencesRepository) {
    this.userPreferencesRepository = userPreferencesRepository;
  }
  userPreferencesRepository;
  async execute({
    userId
  }) {
    const existing = await this.userPreferencesRepository.findByUserId(userId);
    if (existing) {
      throw new UserPreferencesAlreadyExistsError();
    }
    const userPreferences = await this.userPreferencesRepository.create({
      user_id: userId,
      preferences: { ...DEFAULT_PREFERENCES }
    });
    return { userPreferences };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateDefaultUserPreferencesUseCase
});
