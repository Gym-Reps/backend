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

// src/use-cases/user-preferences/get-user-preferences/get-user-preferences.ts
var get_user_preferences_exports = {};
__export(get_user_preferences_exports, {
  GetUserPreferencesUseCase: () => GetUserPreferencesUseCase
});
module.exports = __toCommonJS(get_user_preferences_exports);

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/user-preferences/get-user-preferences/get-user-preferences.ts
var GetUserPreferencesUseCase = class {
  constructor(userPreferencesRepository) {
    this.userPreferencesRepository = userPreferencesRepository;
  }
  userPreferencesRepository;
  async execute({
    userId
  }) {
    const userPreferences = await this.userPreferencesRepository.findByUserId(userId);
    if (!userPreferences) {
      throw new ResourceNotFoundError();
    }
    return { userPreferences };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetUserPreferencesUseCase
});
