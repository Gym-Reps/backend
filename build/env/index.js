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

// src/env/index.ts
var env_exports = {};
__export(env_exports, {
  env: () => env
});
module.exports = __toCommonJS(env_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  env
});
