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

// src/use-cases/default-exercises/create-exercise/create-exercise.ts
var create_exercise_exports = {};
__export(create_exercise_exports, {
  CreateExerciseUseCase: () => CreateExerciseUseCase
});
module.exports = __toCommonJS(create_exercise_exports);

// src/use-cases/errors/exercise-already-exists-error.ts
var ExerciseAlreadyExistsError = class extends Error {
  constructor() {
    super("Exercise already exists");
  }
};

// src/use-cases/_utils/slugify.ts
function slugify(value) {
  return value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// src/use-cases/default-exercises/create-exercise/create-exercise.ts
var CreateExerciseUseCase = class {
  constructor(defaultExercisesRepository) {
    this.defaultExercisesRepository = defaultExercisesRepository;
  }
  defaultExercisesRepository;
  async execute({
    title,
    muscleGroup,
    imagePath,
    slug
  }) {
    const finalSlug = slug ?? slugify(title);
    const existing = await this.defaultExercisesRepository.findBySlug(finalSlug);
    if (existing) {
      throw new ExerciseAlreadyExistsError();
    }
    const exercise = await this.defaultExercisesRepository.create({
      title,
      slug: finalSlug,
      muscle_group: muscleGroup,
      image_path: imagePath
    });
    return { exercise };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateExerciseUseCase
});
