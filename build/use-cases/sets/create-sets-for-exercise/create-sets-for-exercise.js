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

// src/use-cases/sets/create-sets-for-exercise/create-sets-for-exercise.ts
var create_sets_for_exercise_exports = {};
__export(create_sets_for_exercise_exports, {
  CreateSetsForExerciseUseCase: () => CreateSetsForExerciseUseCase
});
module.exports = __toCommonJS(create_sets_for_exercise_exports);

// src/use-cases/_types/planned-sets.ts
function plannedSetIndices(plannedSets) {
  return Object.keys(plannedSets).map(Number).sort((a, b) => a - b);
}

// src/use-cases/sets/create-sets-for-exercise/create-sets-for-exercise.ts
var CreateSetsForExerciseUseCase = class {
  constructor(setsRepository) {
    this.setsRepository = setsRepository;
  }
  setsRepository;
  async execute({
    userId,
    trainmentId,
    exerciseId,
    plannedSets
  }) {
    const sets = await this.setsRepository.createMany(
      plannedSetIndices(plannedSets).map((index) => ({
        trainment_id: trainmentId,
        exercise_id: exerciseId,
        user_id: userId,
        index,
        weight: null,
        repetitions: null
      }))
    );
    return { sets };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateSetsForExerciseUseCase
});
