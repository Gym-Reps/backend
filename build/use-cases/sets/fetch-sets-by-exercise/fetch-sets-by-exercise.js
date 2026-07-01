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

// src/use-cases/sets/fetch-sets-by-exercise/fetch-sets-by-exercise.ts
var fetch_sets_by_exercise_exports = {};
__export(fetch_sets_by_exercise_exports, {
  FetchSetsByExerciseUseCase: () => FetchSetsByExerciseUseCase
});
module.exports = __toCommonJS(fetch_sets_by_exercise_exports);

// src/use-cases/errors/not-allowed-error.ts
var NotAllowedError = class extends Error {
  constructor() {
    super("Not allowed");
  }
};

// src/use-cases/sets/fetch-sets-by-exercise/fetch-sets-by-exercise.ts
var FetchSetsByExerciseUseCase = class {
  constructor(setsRepository) {
    this.setsRepository = setsRepository;
  }
  setsRepository;
  async execute({
    userId,
    exerciseId
  }) {
    const sets = await this.setsRepository.findManyByExerciseId(exerciseId);
    if (sets.length > 0 && sets[0]?.user_id !== userId) {
      throw new NotAllowedError();
    }
    return { sets };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchSetsByExerciseUseCase
});
