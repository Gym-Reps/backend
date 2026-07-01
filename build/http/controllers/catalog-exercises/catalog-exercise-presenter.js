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

// src/http/controllers/catalog-exercises/catalog-exercise-presenter.ts
var catalog_exercise_presenter_exports = {};
__export(catalog_exercise_presenter_exports, {
  catalogExerciseToHTTP: () => catalogExerciseToHTTP
});
module.exports = __toCommonJS(catalog_exercise_presenter_exports);

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "test", "prod"]).default("dev"),
  PORT: import_zod.z.coerce.number().default(3333),
  DATABASE_URL: import_zod.z.url(),
  SECRET_KEY: import_zod.z.string(),
  APP_URL: import_zod.z.url().default("http://localhost:3333"),
  // Comma-separated list of allowed origins, or "*" to
  //  reflect any origin.
  CORS_ORIGIN: import_zod.z.string().default("*"),
  // Shared Redis connection for the BullMQ queue + worker (08_EVENTS_MODULE).
  REDIS_URL: import_zod.z.url().default("redis://localhost:6379")
});
var _env = envSchema.safeParse({
  NODE_ENV: process.env["NODE_ENV"],
  PORT: process.env["PORT"],
  DATABASE_URL: process.env["DATABASE_URL"],
  SECRET_KEY: process.env["SECRET_KEY"],
  APP_URL: process.env["APP_URL"],
  CORS_ORIGIN: process.env["CORS_ORIGIN"],
  REDIS_URL: process.env["REDIS_URL"]
});
if (!_env.success) {
  console.error(`Invalid environment variables, ${import_zod.z.treeifyError(_env.error)}`);
  throw new Error("Invalid environment variables");
}
var env = _env.data;

// src/http/controllers/catalog-exercises/catalog-exercise-presenter.ts
function catalogExerciseToHTTP(exercise) {
  return {
    id: exercise.id,
    title: exercise.title,
    slug: exercise.slug,
    muscleGroup: exercise.muscle_group,
    imageUrl: `${env.APP_URL}${exercise.image_path}`
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  catalogExerciseToHTTP
});
