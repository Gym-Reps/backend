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

// src/use-cases/default-exercises/search-exercises/search-exercises.ts
var search_exercises_exports = {};
__export(search_exercises_exports, {
  SearchExercisesUseCase: () => SearchExercisesUseCase
});
module.exports = __toCommonJS(search_exercises_exports);
var SearchExercisesUseCase = class {
  constructor(defaultExercisesRepository) {
    this.defaultExercisesRepository = defaultExercisesRepository;
  }
  defaultExercisesRepository;
  async execute({
    query,
    muscleGroup,
    page
  }) {
    const { exercises, total } = await this.defaultExercisesRepository.findMany({
      page,
      ...query ? { query } : {},
      ...muscleGroup ? { muscleGroup } : {}
    });
    return { exercises, total };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SearchExercisesUseCase
});
