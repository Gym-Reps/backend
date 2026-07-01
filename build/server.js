"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_node_path = __toESM(require("path"));
var import_cookie = __toESM(require("@fastify/cookie"));
var import_jwt = __toESM(require("@fastify/jwt"));
var import_static = __toESM(require("@fastify/static"));
var import_fastify = __toESM(require("fastify"));
var import_zod33 = require("zod");

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

// src/http/middlewares/verify-jwt.ts
async function verifyJWT(request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Unauthorized." });
  }
}

// src/http/middlewares/verify-user-role.ts
function verifyUserRole(roleToVerify) {
  return async (request, reply) => {
    const { role } = request.user;
    if (role !== roleToVerify) {
      return reply.status(401).send({ message: "Unauthorized." });
    }
  };
}

// src/http/controllers/catalog-exercises/create-exercise/create-exercise.ts
var import_zod2 = require("zod");

// src/lib/prisma.ts
var import_adapter_pg = require("@prisma/adapter-pg");

// generated/prisma/client.ts
var path = __toESM(require("path"));
var import_node_url = require("url");

// generated/prisma/internal/class.ts
var runtime = __toESM(require("@prisma/client/runtime/client"));
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Role {\n  MEMBER\n  ADMIN\n}\n\nenum EventType {\n  COMPUTE_TRAINMENT_METRICS\n}\n\nenum EventStatus {\n  PENDING\n  PROCESSING\n  COMPLETED\n  FAILED\n}\n\nenum MuscleGroup {\n  CHEST\n  BACK\n  SHOULDERS\n  BICEPS\n  TRICEPS\n  FOREARMS\n  CORE\n  QUADS\n  HAMSTRINGS\n  GLUTES\n  CALVES\n  FULL_BODY\n}\n\nmodel DefaultExercise {\n  id           String      @id @default(uuid())\n  title        String\n  slug         String      @unique\n  muscle_group MuscleGroup\n  image_path   String\n  created_at   DateTime    @default(now())\n  updated_at   DateTime    @updatedAt\n\n  exerciseTemplates ExerciseTemplate[]\n\n  @@map("default_exercises")\n}\n\nmodel User {\n  id            String    @id @default(uuid())\n  username      String    @unique\n  email         String    @unique\n  password_hash String\n  role          Role      @default(MEMBER)\n  created_at    DateTime  @default(now())\n  updated_at    DateTime  @updatedAt\n  deleted_at    DateTime?\n\n  trainmentTemplates TrainmentTemplate[]\n  trainments         Trainment[]\n  sets               Set[]\n  events             Event[]\n  metrics            Metric[]\n  preferences        UserPreferences?\n\n  @@map("users")\n}\n\n// Per-user UI/measurement preferences (02_USER_PREFERENCES). One row per user\n// (user_id unique). The enum/shape constraints live in application code (Zod),\n// not Postgres \u2014 the column is free-form JSONB defaulting to `{}`.\nmodel UserPreferences {\n  id          String   @id @default(uuid())\n  user        User     @relation(fields: [user_id], references: [id])\n  user_id     String   @unique\n  preferences Json     @default("{}")\n  created_at  DateTime @default(now())\n  updated_at  DateTime @updatedAt\n\n  @@map("user_preferences")\n}\n\nmodel TrainmentTemplate {\n  id         String    @id @default(uuid())\n  title      String\n  user       User      @relation(fields: [user_id], references: [id])\n  user_id    String\n  created_at DateTime  @default(now())\n  updated_at DateTime  @updatedAt\n  deleted_at DateTime?\n\n  exerciseTemplates ExerciseTemplate[]\n  trainments        Trainment[]\n\n  @@map("trainment_templates")\n}\n\nmodel ExerciseTemplate {\n  id String @id @default(uuid())\n\n  trainmentTemplate     TrainmentTemplate @relation(fields: [trainment_template_id], references: [id])\n  trainment_template_id String\n\n  defaultExercise     DefaultExercise @relation(fields: [exercise_catalog_id], references: [id])\n  exercise_catalog_id String\n\n  title      String\n  created_at DateTime  @default(now())\n  deleted_at DateTime?\n\n  exercises Exercise[]\n\n  @@map("exercise_templates")\n}\n\nmodel Trainment {\n  id String @id @default(uuid())\n\n  trainmentTemplate     TrainmentTemplate @relation(fields: [trainment_template_id], references: [id])\n  trainment_template_id String\n\n  user    User   @relation(fields: [user_id], references: [id])\n  user_id String\n\n  started_at  DateTime   @default(now())\n  finished_at DateTime?\n  exercises   Exercise[]\n  sets        Set[]\n  metrics     Metric[]\n\n  @@map("trainments")\n}\n\nmodel Exercise {\n  id String @id @default(uuid())\n\n  exerciseTemplate     ExerciseTemplate @relation(fields: [exercise_template_id], references: [id])\n  exercise_template_id String\n\n  trainment    Trainment @relation(fields: [trainment_id], references: [id])\n  trainment_id String\n\n  planned_sets Json     @default("{}")\n  created_at   DateTime @default(now())\n\n  sets    Set[]\n  metrics Metric[]\n\n  @@map("exercises")\n}\n\nmodel Set {\n  id String @id @default(uuid())\n\n  trainment    Trainment @relation(fields: [trainment_id], references: [id])\n  trainment_id String\n\n  exercise    Exercise @relation(fields: [exercise_id], references: [id])\n  exercise_id String\n\n  user    User   @relation(fields: [user_id], references: [id])\n  user_id String\n\n  index        Int /* 1-based set index; maps to a planned_sets key */\n  weight       Float?\n  repetitions  Int?\n  performed_at DateTime @default(now())\n\n  // Metric back-relations (09_METRICS): a set can be the "previous" reference for\n  // many later metrics, but is the "current" of at most one (current_set_id unique).\n  previousSetMetrics Metric[] @relation("PreviousSetMetric")\n  currentSetMetric   Metric?  @relation("CurrentSetMetric")\n\n  @@unique([exercise_id, index])\n  @@map("sets")\n}\n\nmodel Event {\n  id           String      @id @default(uuid())\n  event_type   EventType\n  status       EventStatus @default(PENDING)\n  user         User        @relation(fields: [user_id], references: [id])\n  user_id      String\n  metadata     Json        @default("{}")\n  attempts     Int         @default(0)\n  last_error   String?\n  created_at   DateTime    @default(now())\n  updated_at   DateTime    @updatedAt\n  processed_at DateTime?\n\n  @@index([status, created_at]) // sweeper lookup for stuck PENDING rows\n  @@map("events")\n}\n\n// Per-set progress diff (09_METRICS) between the same exercise slot across a\n// user\'s consecutive same-template sessions. Written only by the async\n// COMPUTE_TRAINMENT_METRICS handler; unique current_set_id makes it idempotent.\nmodel Metric {\n  id               String    @id @default(uuid())\n  user             User      @relation(fields: [user_id], references: [id])\n  user_id          String\n  trainment        Trainment @relation(fields: [trainment_id], references: [id])\n  trainment_id     String\n  exercise         Exercise  @relation(fields: [exercise_id], references: [id])\n  exercise_id      String\n  previousSet      Set       @relation("PreviousSetMetric", fields: [previous_set_id], references: [id])\n  previous_set_id  String\n  currentSet       Set       @relation("CurrentSetMetric", fields: [current_set_id], references: [id])\n  current_set_id   String    @unique\n  weight_diff      Float\n  repetitions_diff Int\n  created_at       DateTime  @default(now())\n\n  @@index([trainment_id])\n  @@index([exercise_id])\n  @@map("metrics")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"DefaultExercise":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"muscle_group","kind":"enum","type":"MuscleGroup"},{"name":"image_path","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"exerciseTemplates","kind":"object","type":"ExerciseTemplate","relationName":"DefaultExerciseToExerciseTemplate"}],"dbName":"default_exercises"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password_hash","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"deleted_at","kind":"scalar","type":"DateTime"},{"name":"trainmentTemplates","kind":"object","type":"TrainmentTemplate","relationName":"TrainmentTemplateToUser"},{"name":"trainments","kind":"object","type":"Trainment","relationName":"TrainmentToUser"},{"name":"sets","kind":"object","type":"Set","relationName":"SetToUser"},{"name":"events","kind":"object","type":"Event","relationName":"EventToUser"},{"name":"metrics","kind":"object","type":"Metric","relationName":"MetricToUser"},{"name":"preferences","kind":"object","type":"UserPreferences","relationName":"UserToUserPreferences"}],"dbName":"users"},"UserPreferences":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserPreferences"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"preferences","kind":"scalar","type":"Json"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"}],"dbName":"user_preferences"},"TrainmentTemplate":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TrainmentTemplateToUser"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"deleted_at","kind":"scalar","type":"DateTime"},{"name":"exerciseTemplates","kind":"object","type":"ExerciseTemplate","relationName":"ExerciseTemplateToTrainmentTemplate"},{"name":"trainments","kind":"object","type":"Trainment","relationName":"TrainmentToTrainmentTemplate"}],"dbName":"trainment_templates"},"ExerciseTemplate":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"trainmentTemplate","kind":"object","type":"TrainmentTemplate","relationName":"ExerciseTemplateToTrainmentTemplate"},{"name":"trainment_template_id","kind":"scalar","type":"String"},{"name":"defaultExercise","kind":"object","type":"DefaultExercise","relationName":"DefaultExerciseToExerciseTemplate"},{"name":"exercise_catalog_id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"deleted_at","kind":"scalar","type":"DateTime"},{"name":"exercises","kind":"object","type":"Exercise","relationName":"ExerciseToExerciseTemplate"}],"dbName":"exercise_templates"},"Trainment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"trainmentTemplate","kind":"object","type":"TrainmentTemplate","relationName":"TrainmentToTrainmentTemplate"},{"name":"trainment_template_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TrainmentToUser"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"started_at","kind":"scalar","type":"DateTime"},{"name":"finished_at","kind":"scalar","type":"DateTime"},{"name":"exercises","kind":"object","type":"Exercise","relationName":"ExerciseToTrainment"},{"name":"sets","kind":"object","type":"Set","relationName":"SetToTrainment"},{"name":"metrics","kind":"object","type":"Metric","relationName":"MetricToTrainment"}],"dbName":"trainments"},"Exercise":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"exerciseTemplate","kind":"object","type":"ExerciseTemplate","relationName":"ExerciseToExerciseTemplate"},{"name":"exercise_template_id","kind":"scalar","type":"String"},{"name":"trainment","kind":"object","type":"Trainment","relationName":"ExerciseToTrainment"},{"name":"trainment_id","kind":"scalar","type":"String"},{"name":"planned_sets","kind":"scalar","type":"Json"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"sets","kind":"object","type":"Set","relationName":"ExerciseToSet"},{"name":"metrics","kind":"object","type":"Metric","relationName":"ExerciseToMetric"}],"dbName":"exercises"},"Set":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"trainment","kind":"object","type":"Trainment","relationName":"SetToTrainment"},{"name":"trainment_id","kind":"scalar","type":"String"},{"name":"exercise","kind":"object","type":"Exercise","relationName":"ExerciseToSet"},{"name":"exercise_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SetToUser"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"index","kind":"scalar","type":"Int"},{"name":"weight","kind":"scalar","type":"Float"},{"name":"repetitions","kind":"scalar","type":"Int"},{"name":"performed_at","kind":"scalar","type":"DateTime"},{"name":"previousSetMetrics","kind":"object","type":"Metric","relationName":"PreviousSetMetric"},{"name":"currentSetMetric","kind":"object","type":"Metric","relationName":"CurrentSetMetric"}],"dbName":"sets"},"Event":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"event_type","kind":"enum","type":"EventType"},{"name":"status","kind":"enum","type":"EventStatus"},{"name":"user","kind":"object","type":"User","relationName":"EventToUser"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"attempts","kind":"scalar","type":"Int"},{"name":"last_error","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"updated_at","kind":"scalar","type":"DateTime"},{"name":"processed_at","kind":"scalar","type":"DateTime"}],"dbName":"events"},"Metric":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"MetricToUser"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"trainment","kind":"object","type":"Trainment","relationName":"MetricToTrainment"},{"name":"trainment_id","kind":"scalar","type":"String"},{"name":"exercise","kind":"object","type":"Exercise","relationName":"ExerciseToMetric"},{"name":"exercise_id","kind":"scalar","type":"String"},{"name":"previousSet","kind":"object","type":"Set","relationName":"PreviousSetMetric"},{"name":"previous_set_id","kind":"scalar","type":"String"},{"name":"currentSet","kind":"object","type":"Set","relationName":"CurrentSetMetric"},{"name":"current_set_id","kind":"scalar","type":"String"},{"name":"weight_diff","kind":"scalar","type":"Float"},{"name":"repetitions_diff","kind":"scalar","type":"Int"},{"name":"created_at","kind":"scalar","type":"DateTime"}],"dbName":"metrics"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","trainmentTemplates","trainmentTemplate","user","exerciseTemplate","trainment","exercise","previousSet","currentSet","previousSetMetrics","currentSetMetric","_count","sets","metrics","exercises","trainments","events","preferences","exerciseTemplates","defaultExercise","DefaultExercise.findUnique","DefaultExercise.findUniqueOrThrow","DefaultExercise.findFirst","DefaultExercise.findFirstOrThrow","DefaultExercise.findMany","data","DefaultExercise.createOne","DefaultExercise.createMany","DefaultExercise.createManyAndReturn","DefaultExercise.updateOne","DefaultExercise.updateMany","DefaultExercise.updateManyAndReturn","create","update","DefaultExercise.upsertOne","DefaultExercise.deleteOne","DefaultExercise.deleteMany","having","_min","_max","DefaultExercise.groupBy","DefaultExercise.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","UserPreferences.findUnique","UserPreferences.findUniqueOrThrow","UserPreferences.findFirst","UserPreferences.findFirstOrThrow","UserPreferences.findMany","UserPreferences.createOne","UserPreferences.createMany","UserPreferences.createManyAndReturn","UserPreferences.updateOne","UserPreferences.updateMany","UserPreferences.updateManyAndReturn","UserPreferences.upsertOne","UserPreferences.deleteOne","UserPreferences.deleteMany","UserPreferences.groupBy","UserPreferences.aggregate","TrainmentTemplate.findUnique","TrainmentTemplate.findUniqueOrThrow","TrainmentTemplate.findFirst","TrainmentTemplate.findFirstOrThrow","TrainmentTemplate.findMany","TrainmentTemplate.createOne","TrainmentTemplate.createMany","TrainmentTemplate.createManyAndReturn","TrainmentTemplate.updateOne","TrainmentTemplate.updateMany","TrainmentTemplate.updateManyAndReturn","TrainmentTemplate.upsertOne","TrainmentTemplate.deleteOne","TrainmentTemplate.deleteMany","TrainmentTemplate.groupBy","TrainmentTemplate.aggregate","ExerciseTemplate.findUnique","ExerciseTemplate.findUniqueOrThrow","ExerciseTemplate.findFirst","ExerciseTemplate.findFirstOrThrow","ExerciseTemplate.findMany","ExerciseTemplate.createOne","ExerciseTemplate.createMany","ExerciseTemplate.createManyAndReturn","ExerciseTemplate.updateOne","ExerciseTemplate.updateMany","ExerciseTemplate.updateManyAndReturn","ExerciseTemplate.upsertOne","ExerciseTemplate.deleteOne","ExerciseTemplate.deleteMany","ExerciseTemplate.groupBy","ExerciseTemplate.aggregate","Trainment.findUnique","Trainment.findUniqueOrThrow","Trainment.findFirst","Trainment.findFirstOrThrow","Trainment.findMany","Trainment.createOne","Trainment.createMany","Trainment.createManyAndReturn","Trainment.updateOne","Trainment.updateMany","Trainment.updateManyAndReturn","Trainment.upsertOne","Trainment.deleteOne","Trainment.deleteMany","Trainment.groupBy","Trainment.aggregate","Exercise.findUnique","Exercise.findUniqueOrThrow","Exercise.findFirst","Exercise.findFirstOrThrow","Exercise.findMany","Exercise.createOne","Exercise.createMany","Exercise.createManyAndReturn","Exercise.updateOne","Exercise.updateMany","Exercise.updateManyAndReturn","Exercise.upsertOne","Exercise.deleteOne","Exercise.deleteMany","Exercise.groupBy","Exercise.aggregate","Set.findUnique","Set.findUniqueOrThrow","Set.findFirst","Set.findFirstOrThrow","Set.findMany","Set.createOne","Set.createMany","Set.createManyAndReturn","Set.updateOne","Set.updateMany","Set.updateManyAndReturn","Set.upsertOne","Set.deleteOne","Set.deleteMany","_avg","_sum","Set.groupBy","Set.aggregate","Event.findUnique","Event.findUniqueOrThrow","Event.findFirst","Event.findFirstOrThrow","Event.findMany","Event.createOne","Event.createMany","Event.createManyAndReturn","Event.updateOne","Event.updateMany","Event.updateManyAndReturn","Event.upsertOne","Event.deleteOne","Event.deleteMany","Event.groupBy","Event.aggregate","Metric.findUnique","Metric.findUniqueOrThrow","Metric.findFirst","Metric.findFirstOrThrow","Metric.findMany","Metric.createOne","Metric.createMany","Metric.createManyAndReturn","Metric.updateOne","Metric.updateMany","Metric.updateManyAndReturn","Metric.upsertOne","Metric.deleteOne","Metric.deleteMany","Metric.groupBy","Metric.aggregate","AND","OR","NOT","id","user_id","trainment_id","exercise_id","previous_set_id","current_set_id","weight_diff","repetitions_diff","created_at","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","EventType","event_type","EventStatus","status","metadata","attempts","last_error","updated_at","processed_at","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","index","weight","repetitions","performed_at","exercise_template_id","planned_sets","trainment_template_id","started_at","finished_at","exercise_catalog_id","title","deleted_at","username","email","password_hash","Role","role","every","some","none","slug","MuscleGroup","muscle_group","image_path","exercise_id_index","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "gQZeoAELFAAA2wIAIL4BAADZAgAwvwEAADoAEMABAADZAgAwwQEBAAAAAckBQADFAgAh3AFAAMUCACHuAQEAzAIAIfgBAQAAAAH6AQAA2gL6ASL7AQEAzAIAIQEAAAABACAMBAAA7gIAIBAAAO8CACAVAADyAgAgvgEAAPECADC_AQAAAwAQwAEAAPECADDBAQEAzAIAIckBQADFAgAh6gEBAMwCACHtAQEAzAIAIe4BAQDMAgAh7wFAAM4CACEEBAAAmwUAIBAAAJwFACAVAACdBQAg7wEAAIYDACAMBAAA7gIAIBAAAO8CACAVAADyAgAgvgEAAPECADC_AQAAAwAQwAEAAPECADDBAQEAAAAByQFAAMUCACHqAQEAzAIAIe0BAQDMAgAh7gEBAMwCACHvAUAAzgIAIQMAAAADACABAAAEADACAAAFACAMBQAAxgIAIBEAANACACAUAADbAgAgvgEAAPACADC_AQAABwAQwAEAAPACADDBAQEAzAIAIcIBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe4BAQDMAgAh7wFAAM4CACEEBQAAtwQAIBEAAIEFACAUAACVBQAg7wEAAIYDACAMBQAAxgIAIBEAANACACAUAADbAgAgvgEAAPACADC_AQAABwAQwAEAAPACADDBAQEAAAABwgEBAMwCACHJAUAAxQIAIdwBQADFAgAh7gEBAMwCACHvAUAAzgIAIQMAAAAHACABAAAIADACAAAJACANBAAA7gIAIAUAAMYCACAOAADRAgAgDwAA0wIAIBAAAO8CACC-AQAA7QIAML8BAAALABDAAQAA7QIAMMEBAQDMAgAhwgEBAMwCACHqAQEAzAIAIesBQADFAgAh7AFAAM4CACEGBAAAmwUAIAUAALcEACAOAACCBQAgDwAAhAUAIBAAAJwFACDsAQAAhgMAIA0EAADuAgAgBQAAxgIAIA4AANECACAPAADTAgAgEAAA7wIAIL4BAADtAgAwvwEAAAsAEMABAADtAgAwwQEBAAAAAcIBAQDMAgAh6gEBAMwCACHrAUAAxQIAIewBQADOAgAhAwAAAAsAIAEAAAwAMAIAAA0AIAwGAADsAgAgBwAA4wIAIA4AANECACAPAADTAgAgvgEAAOsCADC_AQAADwAQwAEAAOsCADDBAQEAzAIAIcMBAQDMAgAhyQFAAMUCACHoAQEAzAIAIekBAADEAgAgBAYAAJoFACAHAACWBQAgDgAAggUAIA8AAIQFACAMBgAA7AIAIAcAAOMCACAOAADRAgAgDwAA0wIAIL4BAADrAgAwvwEAAA8AEMABAADrAgAwwQEBAAAAAcMBAQDMAgAhyQFAAMUCACHoAQEAzAIAIekBAADEAgAgAwAAAA8AIAEAABAAMAIAABEAIBAFAADGAgAgBwAA4wIAIAgAAOQCACALAADTAgAgDAAA6gIAIL4BAADnAgAwvwEAABMAEMABAADnAgAwwQEBAMwCACHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHkAQIA3wIAIeUBCADoAgAh5gECAOkCACHnAUAAxQIAIQcFAAC3BAAgBwAAlgUAIAgAAJcFACALAACEBQAgDAAAmQUAIOUBAACGAwAg5gEAAIYDACARBQAAxgIAIAcAAOMCACAIAADkAgAgCwAA0wIAIAwAAOoCACC-AQAA5wIAML8BAAATABDAAQAA5wIAMMEBAQAAAAHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHkAQIA3wIAIeUBCADoAgAh5gECAOkCACHnAUAAxQIAIfwBAADmAgAgAwAAABMAIAEAABQAMAIAABUAIBEFAADGAgAgBwAA4wIAIAgAAOQCACAJAADlAgAgCgAA5QIAIL4BAADhAgAwvwEAABcAEMABAADhAgAwwQEBAMwCACHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHFAQEAzAIAIcYBAQDMAgAhxwEIAOICACHIAQIA3wIAIckBQADFAgAhBQUAALcEACAHAACWBQAgCAAAlwUAIAkAAJgFACAKAACYBQAgEQUAAMYCACAHAADjAgAgCAAA5AIAIAkAAOUCACAKAADlAgAgvgEAAOECADC_AQAAFwAQwAEAAOECADDBAQEAAAABwgEBAMwCACHDAQEAzAIAIcQBAQDMAgAhxQEBAMwCACHGAQEAAAABxwEIAOICACHIAQIA3wIAIckBQADFAgAhAwAAABcAIAEAABgAMAIAABkAIAEAAAAXACABAAAAFwAgAwAAABcAIAEAABgAMAIAABkAIAEAAAATACABAAAAFwAgAwAAABMAIAEAABQAMAIAABUAIAMAAAAXACABAAAYADACAAAZACABAAAADwAgAQAAABMAIAEAAAAXACADAAAAEwAgAQAAFAAwAgAAFQAgDgUAAMYCACC-AQAA3AIAML8BAAAmABDAAQAA3AIAMMEBAQDMAgAhwgEBAMwCACHJAUAAxQIAIdYBAADdAtYBItgBAADeAtgBItkBAADEAgAg2gECAN8CACHbAQEA4AIAIdwBQADFAgAh3QFAAM4CACEDBQAAtwQAINsBAACGAwAg3QEAAIYDACAOBQAAxgIAIL4BAADcAgAwvwEAACYAEMABAADcAgAwwQEBAAAAAcIBAQDMAgAhyQFAAMUCACHWAQAA3QLWASLYAQAA3gLYASLZAQAAxAIAINoBAgDfAgAh2wEBAOACACHcAUAAxQIAId0BQADOAgAhAwAAACYAIAEAACcAMAIAACgAIAMAAAAXACABAAAYADACAAAZACAJBQAAxgIAIBMAAMQCACC-AQAAwwIAML8BAAArABDAAQAAwwIAMMEBAQDMAgAhwgEBAMwCACHJAUAAxQIAIdwBQADFAgAhAQAAACsAIAEAAAAHACABAAAACwAgAQAAABMAIAEAAAAmACABAAAAFwAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAALACABAAAMADACAAANACABAAAAAwAgAQAAAAsAIAMAAAAPACABAAAQADACAAARACABAAAADwAgAQAAAAMAIAEAAAABACALFAAA2wIAIL4BAADZAgAwvwEAADoAEMABAADZAgAwwQEBAMwCACHJAUAAxQIAIdwBQADFAgAh7gEBAMwCACH4AQEAzAIAIfoBAADaAvoBIvsBAQDMAgAhARQAAJUFACADAAAAOgAgAQAAOwAwAgAAAQAgAwAAADoAIAEAADsAMAIAAAEAIAMAAAA6ACABAAA7ADACAAABACAIFAAAlAUAIMEBAQAAAAHJAUAAAAAB3AFAAAAAAe4BAQAAAAH4AQEAAAAB-gEAAAD6AQL7AQEAAAABARsAAD8AIAfBAQEAAAAByQFAAAAAAdwBQAAAAAHuAQEAAAAB-AEBAAAAAfoBAAAA-gEC-wEBAAAAAQEbAABBADABGwAAQQAwCBQAAIoFACDBAQEA-AIAIckBQAD7AgAh3AFAAPsCACHuAQEA-AIAIfgBAQD4AgAh-gEAAIkF-gEi-wEBAPgCACECAAAAAQAgGwAARAAgB8EBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh-AEBAPgCACH6AQAAiQX6ASL7AQEA-AIAIQIAAAA6ACAbAABGACACAAAAOgAgGwAARgAgAwAAAAEAICIAAD8AICMAAEQAIAEAAAABACABAAAAOgAgAw0AAIYFACAoAACIBQAgKQAAhwUAIAq-AQAA1QIAML8BAABNABDAAQAA1QIAMMEBAQCcAgAhyQFAAJ8CACHcAUAAnwIAIe4BAQCcAgAh-AEBAJwCACH6AQAA1gL6ASL7AQEAnAIAIQMAAAA6ACABAABMADAnAABNACADAAAAOgAgAQAAOwAwAgAAAQAgEQMAAM8CACAOAADRAgAgDwAA0wIAIBEAANACACASAADSAgAgEwAA1AIAIL4BAADLAgAwvwEAAFMAEMABAADLAgAwwQEBAAAAAckBQADFAgAh3AFAAMUCACHvAUAAzgIAIfABAQAAAAHxAQEAAAAB8gEBAMwCACH0AQAAzQL0ASIBAAAAUAAgAQAAAFAAIBEDAADPAgAgDgAA0QIAIA8AANMCACARAADQAgAgEgAA0gIAIBMAANQCACC-AQAAywIAML8BAABTABDAAQAAywIAMMEBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe8BQADOAgAh8AEBAMwCACHxAQEAzAIAIfIBAQDMAgAh9AEAAM0C9AEiBwMAAIAFACAOAACCBQAgDwAAhAUAIBEAAIEFACASAACDBQAgEwAAhQUAIO8BAACGAwAgAwAAAFMAIAEAAFQAMAIAAFAAIAMAAABTACABAABUADACAABQACADAAAAUwAgAQAAVAAwAgAAUAAgDgMAAPoEACAOAAD8BAAgDwAA_gQAIBEAAPsEACASAAD9BAAgEwAA_wQAIMEBAQAAAAHJAUAAAAAB3AFAAAAAAe8BQAAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAH0AQAAAPQBAgEbAABYACAIwQEBAAAAAckBQAAAAAHcAUAAAAAB7wFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfQBAAAA9AECARsAAFoAMAEbAABaADAOAwAAvAQAIA4AAL4EACAPAADABAAgEQAAvQQAIBIAAL8EACATAADBBAAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASICAAAAUAAgGwAAXQAgCMEBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe8BQACPAwAh8AEBAPgCACHxAQEA-AIAIfIBAQD4AgAh9AEAALsE9AEiAgAAAFMAIBsAAF8AIAIAAABTACAbAABfACADAAAAUAAgIgAAWAAgIwAAXQAgAQAAAFAAIAEAAABTACAEDQAAuAQAICgAALoEACApAAC5BAAg7wEAAIYDACALvgEAAMcCADC_AQAAZgAQwAEAAMcCADDBAQEAnAIAIckBQACfAgAh3AFAAJ8CACHvAUAArQIAIfABAQCcAgAh8QEBAJwCACHyAQEAnAIAIfQBAADIAvQBIgMAAABTACABAABlADAnAABmACADAAAAUwAgAQAAVAAwAgAAUAAgCQUAAMYCACATAADEAgAgvgEAAMMCADC_AQAAKwAQwAEAAMMCADDBAQEAAAABwgEBAAAAAckBQADFAgAh3AFAAMUCACEBAAAAaQAgAQAAAGkAIAEFAAC3BAAgAwAAACsAIAEAAGwAMAIAAGkAIAMAAAArACABAABsADACAABpACADAAAAKwAgAQAAbAAwAgAAaQAgBgUAALYEACATgAAAAAHBAQEAAAABwgEBAAAAAckBQAAAAAHcAUAAAAABARsAAHAAIAUTgAAAAAHBAQEAAAABwgEBAAAAAckBQAAAAAHcAUAAAAABARsAAHIAMAEbAAByADAGBQAAtQQAIBOAAAAAAcEBAQD4AgAhwgEBAPgCACHJAUAA-wIAIdwBQAD7AgAhAgAAAGkAIBsAAHUAIAUTgAAAAAHBAQEA-AIAIcIBAQD4AgAhyQFAAPsCACHcAUAA-wIAIQIAAAArACAbAAB3ACACAAAAKwAgGwAAdwAgAwAAAGkAICIAAHAAICMAAHUAIAEAAABpACABAAAAKwAgAw0AALIEACAoAAC0BAAgKQAAswQAIAgTAACrAgAgvgEAAMICADC_AQAAfgAQwAEAAMICADDBAQEAnAIAIcIBAQCcAgAhyQFAAJ8CACHcAUAAnwIAIQMAAAArACABAAB9ADAnAAB-ACADAAAAKwAgAQAAbAAwAgAAaQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAJBQAArwQAIBEAALEEACAUAACwBAAgwQEBAAAAAcIBAQAAAAHJAUAAAAAB3AFAAAAAAe4BAQAAAAHvAUAAAAABARsAAIYBACAGwQEBAAAAAcIBAQAAAAHJAUAAAAAB3AFAAAAAAe4BAQAAAAHvAUAAAAABARsAAIgBADABGwAAiAEAMAkFAACUBAAgEQAAlgQAIBQAAJUEACDBAQEA-AIAIcIBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh7wFAAI8DACECAAAACQAgGwAAiwEAIAbBAQEA-AIAIcIBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh7wFAAI8DACECAAAABwAgGwAAjQEAIAIAAAAHACAbAACNAQAgAwAAAAkAICIAAIYBACAjAACLAQAgAQAAAAkAIAEAAAAHACAEDQAAkQQAICgAAJMEACApAACSBAAg7wEAAIYDACAJvgEAAMECADC_AQAAlAEAEMABAADBAgAwwQEBAJwCACHCAQEAnAIAIckBQACfAgAh3AFAAJ8CACHuAQEAnAIAIe8BQACtAgAhAwAAAAcAIAEAAJMBADAnAACUAQAgAwAAAAcAIAEAAAgAMAIAAAkAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQQAAI4EACAQAACQBAAgFQAAjwQAIMEBAQAAAAHJAUAAAAAB6gEBAAAAAe0BAQAAAAHuAQEAAAAB7wFAAAAAAQEbAACcAQAgBsEBAQAAAAHJAUAAAAAB6gEBAAAAAe0BAQAAAAHuAQEAAAAB7wFAAAAAAQEbAACeAQAwARsAAJ4BADAJBAAAggQAIBAAAIQEACAVAACDBAAgwQEBAPgCACHJAUAA-wIAIeoBAQD4AgAh7QEBAPgCACHuAQEA-AIAIe8BQACPAwAhAgAAAAUAIBsAAKEBACAGwQEBAPgCACHJAUAA-wIAIeoBAQD4AgAh7QEBAPgCACHuAQEA-AIAIe8BQACPAwAhAgAAAAMAIBsAAKMBACACAAAAAwAgGwAAowEAIAMAAAAFACAiAACcAQAgIwAAoQEAIAEAAAAFACABAAAAAwAgBA0AAP8DACAoAACBBAAgKQAAgAQAIO8BAACGAwAgCb4BAADAAgAwvwEAAKoBABDAAQAAwAIAMMEBAQCcAgAhyQFAAJ8CACHqAQEAnAIAIe0BAQCcAgAh7gEBAJwCACHvAUAArQIAIQMAAAADACABAACpAQAwJwAAqgEAIAMAAAADACABAAAEADACAAAFACABAAAADQAgAQAAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAoEAAD6AwAgBQAA-wMAIA4AAP0DACAPAAD-AwAgEAAA_AMAIMEBAQAAAAHCAQEAAAAB6gEBAAAAAesBQAAAAAHsAUAAAAABARsAALIBACAFwQEBAAAAAcIBAQAAAAHqAQEAAAAB6wFAAAAAAewBQAAAAAEBGwAAtAEAMAEbAAC0AQAwCgQAANcDACAFAADYAwAgDgAA2gMAIA8AANsDACAQAADZAwAgwQEBAPgCACHCAQEA-AIAIeoBAQD4AgAh6wFAAPsCACHsAUAAjwMAIQIAAAANACAbAAC3AQAgBcEBAQD4AgAhwgEBAPgCACHqAQEA-AIAIesBQAD7AgAh7AFAAI8DACECAAAACwAgGwAAuQEAIAIAAAALACAbAAC5AQAgAwAAAA0AICIAALIBACAjAAC3AQAgAQAAAA0AIAEAAAALACAEDQAA1AMAICgAANYDACApAADVAwAg7AEAAIYDACAIvgEAAL8CADC_AQAAwAEAEMABAAC_AgAwwQEBAJwCACHCAQEAnAIAIeoBAQCcAgAh6wFAAJ8CACHsAUAArQIAIQMAAAALACABAAC_AQAwJwAAwAEAIAMAAAALACABAAAMADACAAANACABAAAAEQAgAQAAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAkGAADQAwAgBwAA0QMAIA4AANIDACAPAADTAwAgwQEBAAAAAcMBAQAAAAHJAUAAAAAB6AEBAAAAAekBgAAAAAEBGwAAyAEAIAXBAQEAAAABwwEBAAAAAckBQAAAAAHoAQEAAAAB6QGAAAAAAQEbAADKAQAwARsAAMoBADAJBgAAtwMAIAcAALgDACAOAAC5AwAgDwAAugMAIMEBAQD4AgAhwwEBAPgCACHJAUAA-wIAIegBAQD4AgAh6QGAAAAAAQIAAAARACAbAADNAQAgBcEBAQD4AgAhwwEBAPgCACHJAUAA-wIAIegBAQD4AgAh6QGAAAAAAQIAAAAPACAbAADPAQAgAgAAAA8AIBsAAM8BACADAAAAEQAgIgAAyAEAICMAAM0BACABAAAAEQAgAQAAAA8AIAMNAAC0AwAgKAAAtgMAICkAALUDACAIvgEAAL4CADC_AQAA1gEAEMABAAC-AgAwwQEBAJwCACHDAQEAnAIAIckBQACfAgAh6AEBAJwCACHpAQAAqwIAIAMAAAAPACABAADVAQAwJwAA1gEAIAMAAAAPACABAAAQADACAAARACABAAAAFQAgAQAAABUAIAMAAAATACABAAAUADACAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgAwAAABMAIAEAABQAMAIAABUAIA0FAACxAwAgBwAArwMAIAgAALADACALAACyAwAgDAAAswMAIMEBAQAAAAHCAQEAAAABwwEBAAAAAcQBAQAAAAHkAQIAAAAB5QEIAAAAAeYBAgAAAAHnAUAAAAABARsAAN4BACAIwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAeQBAgAAAAHlAQgAAAAB5gECAAAAAecBQAAAAAEBGwAA4AEAMAEbAADgAQAwDQUAAJsDACAHAACZAwAgCAAAmgMAIAsAAJwDACAMAACdAwAgwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHkAQIA-gIAIeUBCACXAwAh5gECAJgDACHnAUAA-wIAIQIAAAAVACAbAADjAQAgCMEBAQD4AgAhwgEBAPgCACHDAQEA-AIAIcQBAQD4AgAh5AECAPoCACHlAQgAlwMAIeYBAgCYAwAh5wFAAPsCACECAAAAEwAgGwAA5QEAIAIAAAATACAbAADlAQAgAwAAABUAICIAAN4BACAjAADjAQAgAQAAABUAIAEAAAATACAHDQAAkgMAICgAAJUDACApAACUAwAgmgEAAJMDACCbAQAAlgMAIOUBAACGAwAg5gEAAIYDACALvgEAALgCADC_AQAA7AEAEMABAAC4AgAwwQEBAJwCACHCAQEAnAIAIcMBAQCcAgAhxAEBAJwCACHkAQIAngIAIeUBCAC5AgAh5gECALoCACHnAUAAnwIAIQMAAAATACABAADrAQAwJwAA7AEAIAMAAAATACABAAAUADACAAAVACABAAAAKAAgAQAAACgAIAMAAAAmACABAAAnADACAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgAwAAACYAIAEAACcAMAIAACgAIAsFAACRAwAgwQEBAAAAAcIBAQAAAAHJAUAAAAAB1gEAAADWAQLYAQAAANgBAtkBgAAAAAHaAQIAAAAB2wEBAAAAAdwBQAAAAAHdAUAAAAABARsAAPQBACAKwQEBAAAAAcIBAQAAAAHJAUAAAAAB1gEAAADWAQLYAQAAANgBAtkBgAAAAAHaAQIAAAAB2wEBAAAAAdwBQAAAAAHdAUAAAAABARsAAPYBADABGwAA9gEAMAsFAACQAwAgwQEBAPgCACHCAQEA-AIAIckBQAD7AgAh1gEAAIwD1gEi2AEAAI0D2AEi2QGAAAAAAdoBAgD6AgAh2wEBAI4DACHcAUAA-wIAId0BQACPAwAhAgAAACgAIBsAAPkBACAKwQEBAPgCACHCAQEA-AIAIckBQAD7AgAh1gEAAIwD1gEi2AEAAI0D2AEi2QGAAAAAAdoBAgD6AgAh2wEBAI4DACHcAUAA-wIAId0BQACPAwAhAgAAACYAIBsAAPsBACACAAAAJgAgGwAA-wEAIAMAAAAoACAiAAD0AQAgIwAA-QEAIAEAAAAoACABAAAAJgAgBw0AAIcDACAoAACKAwAgKQAAiQMAIJoBAACIAwAgmwEAAIsDACDbAQAAhgMAIN0BAACGAwAgDb4BAACoAgAwvwEAAIICABDAAQAAqAIAMMEBAQCcAgAhwgEBAJwCACHJAUAAnwIAIdYBAACpAtYBItgBAACqAtgBItkBAACrAgAg2gECAJ4CACHbAQEArAIAIdwBQACfAgAh3QFAAK0CACEDAAAAJgAgAQAAgQIAMCcAAIICACADAAAAJgAgAQAAJwAwAgAAKAAgAQAAABkAIAEAAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACAOBQAAgQMAIAcAAIIDACAIAACDAwAgCQAAhAMAIAoAAIUDACDBAQEAAAABwgEBAAAAAcMBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQgAAAAByAECAAAAAckBQAAAAAEBGwAAigIAIAnBAQEAAAABwgEBAAAAAcMBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQgAAAAByAECAAAAAckBQAAAAAEBGwAAjAIAMAEbAACMAgAwDgUAAPwCACAHAAD9AgAgCAAA_gIAIAkAAP8CACAKAACAAwAgwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHFAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhAgAAABkAIBsAAI8CACAJwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHFAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhAgAAABcAIBsAAJECACACAAAAFwAgGwAAkQIAIAMAAAAZACAiAACKAgAgIwAAjwIAIAEAAAAZACABAAAAFwAgBQ0AAPMCACAoAAD2AgAgKQAA9QIAIJoBAAD0AgAgmwEAAPcCACAMvgEAAJsCADC_AQAAmAIAEMABAACbAgAwwQEBAJwCACHCAQEAnAIAIcMBAQCcAgAhxAEBAJwCACHFAQEAnAIAIcYBAQCcAgAhxwEIAJ0CACHIAQIAngIAIckBQACfAgAhAwAAABcAIAEAAJcCADAnAACYAgAgAwAAABcAIAEAABgAMAIAABkAIAy-AQAAmwIAML8BAACYAgAQwAEAAJsCADDBAQEAnAIAIcIBAQCcAgAhwwEBAJwCACHEAQEAnAIAIcUBAQCcAgAhxgEBAJwCACHHAQgAnQIAIcgBAgCeAgAhyQFAAJ8CACEODQAAoQIAICgAAKcCACApAACnAgAgygEBAAAAAcsBAQAAAATMAQEAAAAEzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQCmAgAh0gEBAAAAAdMBAQAAAAHUAQEAAAABDQ0AAKECACAoAACkAgAgKQAApAIAIJoBAACkAgAgmwEAAKQCACDKAQgAAAABywEIAAAABMwBCAAAAATNAQgAAAABzgEIAAAAAc8BCAAAAAHQAQgAAAAB0QEIAKUCACENDQAAoQIAICgAAKECACApAAChAgAgmgEAAKQCACCbAQAAoQIAIMoBAgAAAAHLAQIAAAAEzAECAAAABM0BAgAAAAHOAQIAAAABzwECAAAAAdABAgAAAAHRAQIAowIAIQsNAAChAgAgKAAAogIAICkAAKICACDKAUAAAAABywFAAAAABMwBQAAAAATNAUAAAAABzgFAAAAAAc8BQAAAAAHQAUAAAAAB0QFAAKACACELDQAAoQIAICgAAKICACApAACiAgAgygFAAAAAAcsBQAAAAATMAUAAAAAEzQFAAAAAAc4BQAAAAAHPAUAAAAAB0AFAAAAAAdEBQACgAgAhCMoBAgAAAAHLAQIAAAAEzAECAAAABM0BAgAAAAHOAQIAAAABzwECAAAAAdABAgAAAAHRAQIAoQIAIQjKAUAAAAABywFAAAAABMwBQAAAAATNAUAAAAABzgFAAAAAAc8BQAAAAAHQAUAAAAAB0QFAAKICACENDQAAoQIAICgAAKECACApAAChAgAgmgEAAKQCACCbAQAAoQIAIMoBAgAAAAHLAQIAAAAEzAECAAAABM0BAgAAAAHOAQIAAAABzwECAAAAAdABAgAAAAHRAQIAowIAIQjKAQgAAAABywEIAAAABMwBCAAAAATNAQgAAAABzgEIAAAAAc8BCAAAAAHQAQgAAAAB0QEIAKQCACENDQAAoQIAICgAAKQCACApAACkAgAgmgEAAKQCACCbAQAApAIAIMoBCAAAAAHLAQgAAAAEzAEIAAAABM0BCAAAAAHOAQgAAAABzwEIAAAAAdABCAAAAAHRAQgApQIAIQ4NAAChAgAgKAAApwIAICkAAKcCACDKAQEAAAABywEBAAAABMwBAQAAAATNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAKYCACHSAQEAAAAB0wEBAAAAAdQBAQAAAAELygEBAAAAAcsBAQAAAATMAQEAAAAEzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQCnAgAh0gEBAAAAAdMBAQAAAAHUAQEAAAABDb4BAACoAgAwvwEAAIICABDAAQAAqAIAMMEBAQCcAgAhwgEBAJwCACHJAUAAnwIAIdYBAACpAtYBItgBAACqAtgBItkBAACrAgAg2gECAJ4CACHbAQEArAIAIdwBQACfAgAh3QFAAK0CACEHDQAAoQIAICgAALcCACApAAC3AgAgygEAAADWAQLLAQAAANYBCMwBAAAA1gEI0QEAALYC1gEiBw0AAKECACAoAAC1AgAgKQAAtQIAIMoBAAAA2AECywEAAADYAQjMAQAAANgBCNEBAAC0AtgBIg8NAAChAgAgKAAAswIAICkAALMCACDKAYAAAAABzQGAAAAAAc4BgAAAAAHPAYAAAAAB0AGAAAAAAdEBgAAAAAHeAQEAAAAB3wEBAAAAAeABAQAAAAHhAYAAAAAB4gGAAAAAAeMBgAAAAAEODQAArwIAICgAALICACApAACyAgAgygEBAAAAAcsBAQAAAAXMAQEAAAAFzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQCxAgAh0gEBAAAAAdMBAQAAAAHUAQEAAAABCw0AAK8CACAoAACwAgAgKQAAsAIAIMoBQAAAAAHLAUAAAAAFzAFAAAAABc0BQAAAAAHOAUAAAAABzwFAAAAAAdABQAAAAAHRAUAArgIAIQsNAACvAgAgKAAAsAIAICkAALACACDKAUAAAAABywFAAAAABcwBQAAAAAXNAUAAAAABzgFAAAAAAc8BQAAAAAHQAUAAAAAB0QFAAK4CACEIygECAAAAAcsBAgAAAAXMAQIAAAAFzQECAAAAAc4BAgAAAAHPAQIAAAAB0AECAAAAAdEBAgCvAgAhCMoBQAAAAAHLAUAAAAAFzAFAAAAABc0BQAAAAAHOAUAAAAABzwFAAAAAAdABQAAAAAHRAUAAsAIAIQ4NAACvAgAgKAAAsgIAICkAALICACDKAQEAAAABywEBAAAABcwBAQAAAAXNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBALECACHSAQEAAAAB0wEBAAAAAdQBAQAAAAELygEBAAAAAcsBAQAAAAXMAQEAAAAFzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQCyAgAh0gEBAAAAAdMBAQAAAAHUAQEAAAABDMoBgAAAAAHNAYAAAAABzgGAAAAAAc8BgAAAAAHQAYAAAAAB0QGAAAAAAd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBgAAAAAHiAYAAAAAB4wGAAAAAAQcNAAChAgAgKAAAtQIAICkAALUCACDKAQAAANgBAssBAAAA2AEIzAEAAADYAQjRAQAAtALYASIEygEAAADYAQLLAQAAANgBCMwBAAAA2AEI0QEAALUC2AEiBw0AAKECACAoAAC3AgAgKQAAtwIAIMoBAAAA1gECywEAAADWAQjMAQAAANYBCNEBAAC2AtYBIgTKAQAAANYBAssBAAAA1gEIzAEAAADWAQjRAQAAtwLWASILvgEAALgCADC_AQAA7AEAEMABAAC4AgAwwQEBAJwCACHCAQEAnAIAIcMBAQCcAgAhxAEBAJwCACHkAQIAngIAIeUBCAC5AgAh5gECALoCACHnAUAAnwIAIQ0NAACvAgAgKAAAvAIAICkAALwCACCaAQAAvAIAIJsBAAC8AgAgygEIAAAAAcsBCAAAAAXMAQgAAAAFzQEIAAAAAc4BCAAAAAHPAQgAAAAB0AEIAAAAAdEBCAC9AgAhDQ0AAK8CACAoAACvAgAgKQAArwIAIJoBAAC8AgAgmwEAAK8CACDKAQIAAAABywECAAAABcwBAgAAAAXNAQIAAAABzgECAAAAAc8BAgAAAAHQAQIAAAAB0QECALsCACENDQAArwIAICgAAK8CACApAACvAgAgmgEAALwCACCbAQAArwIAIMoBAgAAAAHLAQIAAAAFzAECAAAABc0BAgAAAAHOAQIAAAABzwECAAAAAdABAgAAAAHRAQIAuwIAIQjKAQgAAAABywEIAAAABcwBCAAAAAXNAQgAAAABzgEIAAAAAc8BCAAAAAHQAQgAAAAB0QEIALwCACENDQAArwIAICgAALwCACApAAC8AgAgmgEAALwCACCbAQAAvAIAIMoBCAAAAAHLAQgAAAAFzAEIAAAABc0BCAAAAAHOAQgAAAABzwEIAAAAAdABCAAAAAHRAQgAvQIAIQi-AQAAvgIAML8BAADWAQAQwAEAAL4CADDBAQEAnAIAIcMBAQCcAgAhyQFAAJ8CACHoAQEAnAIAIekBAACrAgAgCL4BAAC_AgAwvwEAAMABABDAAQAAvwIAMMEBAQCcAgAhwgEBAJwCACHqAQEAnAIAIesBQACfAgAh7AFAAK0CACEJvgEAAMACADC_AQAAqgEAEMABAADAAgAwwQEBAJwCACHJAUAAnwIAIeoBAQCcAgAh7QEBAJwCACHuAQEAnAIAIe8BQACtAgAhCb4BAADBAgAwvwEAAJQBABDAAQAAwQIAMMEBAQCcAgAhwgEBAJwCACHJAUAAnwIAIdwBQACfAgAh7gEBAJwCACHvAUAArQIAIQgTAACrAgAgvgEAAMICADC_AQAAfgAQwAEAAMICADDBAQEAnAIAIcIBAQCcAgAhyQFAAJ8CACHcAUAAnwIAIQkFAADGAgAgEwAAxAIAIL4BAADDAgAwvwEAACsAEMABAADDAgAwwQEBAMwCACHCAQEAzAIAIckBQADFAgAh3AFAAMUCACEMygGAAAAAAc0BgAAAAAHOAYAAAAABzwGAAAAAAdABgAAAAAHRAYAAAAAB3gEBAAAAAd8BAQAAAAHgAQEAAAAB4QGAAAAAAeIBgAAAAAHjAYAAAAABCMoBQAAAAAHLAUAAAAAEzAFAAAAABM0BQAAAAAHOAUAAAAABzwFAAAAAAdABQAAAAAHRAUAAogIAIRMDAADPAgAgDgAA0QIAIA8AANMCACARAADQAgAgEgAA0gIAIBMAANQCACC-AQAAywIAML8BAABTABDAAQAAywIAMMEBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe8BQADOAgAh8AEBAMwCACHxAQEAzAIAIfIBAQDMAgAh9AEAAM0C9AEi_QEAAFMAIP4BAABTACALvgEAAMcCADC_AQAAZgAQwAEAAMcCADDBAQEAnAIAIckBQACfAgAh3AFAAJ8CACHvAUAArQIAIfABAQCcAgAh8QEBAJwCACHyAQEAnAIAIfQBAADIAvQBIgcNAAChAgAgKAAAygIAICkAAMoCACDKAQAAAPQBAssBAAAA9AEIzAEAAAD0AQjRAQAAyQL0ASIHDQAAoQIAICgAAMoCACApAADKAgAgygEAAAD0AQLLAQAAAPQBCMwBAAAA9AEI0QEAAMkC9AEiBMoBAAAA9AECywEAAAD0AQjMAQAAAPQBCNEBAADKAvQBIhEDAADPAgAgDgAA0QIAIA8AANMCACARAADQAgAgEgAA0gIAIBMAANQCACC-AQAAywIAML8BAABTABDAAQAAywIAMMEBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe8BQADOAgAh8AEBAMwCACHxAQEAzAIAIfIBAQDMAgAh9AEAAM0C9AEiC8oBAQAAAAHLAQEAAAAEzAEBAAAABM0BAQAAAAHOAQEAAAABzwEBAAAAAdABAQAAAAHRAQEApwIAIdIBAQAAAAHTAQEAAAAB1AEBAAAAAQTKAQAAAPQBAssBAAAA9AEIzAEAAAD0AQjRAQAAygL0ASIIygFAAAAAAcsBQAAAAAXMAUAAAAAFzQFAAAAAAc4BQAAAAAHPAUAAAAAB0AFAAAAAAdEBQACwAgAhA_UBAAAHACD2AQAABwAg9wEAAAcAIAP1AQAACwAg9gEAAAsAIPcBAAALACAD9QEAABMAIPYBAAATACD3AQAAEwAgA_UBAAAmACD2AQAAJgAg9wEAACYAIAP1AQAAFwAg9gEAABcAIPcBAAAXACALBQAAxgIAIBMAAMQCACC-AQAAwwIAML8BAAArABDAAQAAwwIAMMEBAQDMAgAhwgEBAMwCACHJAUAAxQIAIdwBQADFAgAh_QEAACsAIP4BAAArACAKvgEAANUCADC_AQAATQAQwAEAANUCADDBAQEAnAIAIckBQACfAgAh3AFAAJ8CACHuAQEAnAIAIfgBAQCcAgAh-gEAANYC-gEi-wEBAJwCACEHDQAAoQIAICgAANgCACApAADYAgAgygEAAAD6AQLLAQAAAPoBCMwBAAAA-gEI0QEAANcC-gEiBw0AAKECACAoAADYAgAgKQAA2AIAIMoBAAAA-gECywEAAAD6AQjMAQAAAPoBCNEBAADXAvoBIgTKAQAAAPoBAssBAAAA-gEIzAEAAAD6AQjRAQAA2AL6ASILFAAA2wIAIL4BAADZAgAwvwEAADoAEMABAADZAgAwwQEBAMwCACHJAUAAxQIAIdwBQADFAgAh7gEBAMwCACH4AQEAzAIAIfoBAADaAvoBIvsBAQDMAgAhBMoBAAAA-gECywEAAAD6AQjMAQAAAPoBCNEBAADYAvoBIgP1AQAAAwAg9gEAAAMAIPcBAAADACAOBQAAxgIAIL4BAADcAgAwvwEAACYAEMABAADcAgAwwQEBAMwCACHCAQEAzAIAIckBQADFAgAh1gEAAN0C1gEi2AEAAN4C2AEi2QEAAMQCACDaAQIA3wIAIdsBAQDgAgAh3AFAAMUCACHdAUAAzgIAIQTKAQAAANYBAssBAAAA1gEIzAEAAADWAQjRAQAAtwLWASIEygEAAADYAQLLAQAAANgBCMwBAAAA2AEI0QEAALUC2AEiCMoBAgAAAAHLAQIAAAAEzAECAAAABM0BAgAAAAHOAQIAAAABzwECAAAAAdABAgAAAAHRAQIAoQIAIQvKAQEAAAABywEBAAAABcwBAQAAAAXNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBALICACHSAQEAAAAB0wEBAAAAAdQBAQAAAAERBQAAxgIAIAcAAOMCACAIAADkAgAgCQAA5QIAIAoAAOUCACC-AQAA4QIAML8BAAAXABDAAQAA4QIAMMEBAQDMAgAhwgEBAMwCACHDAQEAzAIAIcQBAQDMAgAhxQEBAMwCACHGAQEAzAIAIccBCADiAgAhyAECAN8CACHJAUAAxQIAIQjKAQgAAAABywEIAAAABMwBCAAAAATNAQgAAAABzgEIAAAAAc8BCAAAAAHQAQgAAAAB0QEIAKQCACEPBAAA7gIAIAUAAMYCACAOAADRAgAgDwAA0wIAIBAAAO8CACC-AQAA7QIAML8BAAALABDAAQAA7QIAMMEBAQDMAgAhwgEBAMwCACHqAQEAzAIAIesBQADFAgAh7AFAAM4CACH9AQAACwAg_gEAAAsAIA4GAADsAgAgBwAA4wIAIA4AANECACAPAADTAgAgvgEAAOsCADC_AQAADwAQwAEAAOsCADDBAQEAzAIAIcMBAQDMAgAhyQFAAMUCACHoAQEAzAIAIekBAADEAgAg_QEAAA8AIP4BAAAPACASBQAAxgIAIAcAAOMCACAIAADkAgAgCwAA0wIAIAwAAOoCACC-AQAA5wIAML8BAAATABDAAQAA5wIAMMEBAQDMAgAhwgEBAMwCACHDAQEAzAIAIcQBAQDMAgAh5AECAN8CACHlAQgA6AIAIeYBAgDpAgAh5wFAAMUCACH9AQAAEwAg_gEAABMAIALEAQEAAAAB5AECAAAAARAFAADGAgAgBwAA4wIAIAgAAOQCACALAADTAgAgDAAA6gIAIL4BAADnAgAwvwEAABMAEMABAADnAgAwwQEBAMwCACHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHkAQIA3wIAIeUBCADoAgAh5gECAOkCACHnAUAAxQIAIQjKAQgAAAABywEIAAAABcwBCAAAAAXNAQgAAAABzgEIAAAAAc8BCAAAAAHQAQgAAAAB0QEIALwCACEIygECAAAAAcsBAgAAAAXMAQIAAAAFzQECAAAAAc4BAgAAAAHPAQIAAAAB0AECAAAAAdEBAgCvAgAhEwUAAMYCACAHAADjAgAgCAAA5AIAIAkAAOUCACAKAADlAgAgvgEAAOECADC_AQAAFwAQwAEAAOECADDBAQEAzAIAIcIBAQDMAgAhwwEBAMwCACHEAQEAzAIAIcUBAQDMAgAhxgEBAMwCACHHAQgA4gIAIcgBAgDfAgAhyQFAAMUCACH9AQAAFwAg_gEAABcAIAwGAADsAgAgBwAA4wIAIA4AANECACAPAADTAgAgvgEAAOsCADC_AQAADwAQwAEAAOsCADDBAQEAzAIAIcMBAQDMAgAhyQFAAMUCACHoAQEAzAIAIekBAADEAgAgDgQAAO4CACAQAADvAgAgFQAA8gIAIL4BAADxAgAwvwEAAAMAEMABAADxAgAwwQEBAMwCACHJAUAAxQIAIeoBAQDMAgAh7QEBAMwCACHuAQEAzAIAIe8BQADOAgAh_QEAAAMAIP4BAAADACANBAAA7gIAIAUAAMYCACAOAADRAgAgDwAA0wIAIBAAAO8CACC-AQAA7QIAML8BAAALABDAAQAA7QIAMMEBAQDMAgAhwgEBAMwCACHqAQEAzAIAIesBQADFAgAh7AFAAM4CACEOBQAAxgIAIBEAANACACAUAADbAgAgvgEAAPACADC_AQAABwAQwAEAAPACADDBAQEAzAIAIcIBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe4BAQDMAgAh7wFAAM4CACH9AQAABwAg_gEAAAcAIAP1AQAADwAg9gEAAA8AIPcBAAAPACAMBQAAxgIAIBEAANACACAUAADbAgAgvgEAAPACADC_AQAABwAQwAEAAPACADDBAQEAzAIAIcIBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe4BAQDMAgAh7wFAAM4CACEMBAAA7gIAIBAAAO8CACAVAADyAgAgvgEAAPECADC_AQAAAwAQwAEAAPECADDBAQEAzAIAIckBQADFAgAh6gEBAMwCACHtAQEAzAIAIe4BAQDMAgAh7wFAAM4CACENFAAA2wIAIL4BAADZAgAwvwEAADoAEMABAADZAgAwwQEBAMwCACHJAUAAxQIAIdwBQADFAgAh7gEBAMwCACH4AQEAzAIAIfoBAADaAvoBIvsBAQDMAgAh_QEAADoAIP4BAAA6ACAAAAAAAAGFAgEAAAABBYUCCAAAAAGIAggAAAABiQIIAAAAAYoCCAAAAAGLAggAAAABBYUCAgAAAAGIAgIAAAABiQICAAAAAYoCAgAAAAGLAgIAAAABAYUCQAAAAAEFIgAA8QUAICMAAIAGACD_AQAA8gUAIIACAAD_BQAggwIAAFAAIAUiAADvBQAgIwAA_QUAIP8BAADwBQAggAIAAPwFACCDAgAADQAgBSIAAO0FACAjAAD6BQAg_wEAAO4FACCAAgAA-QUAIIMCAAARACAFIgAA6wUAICMAAPcFACD_AQAA7AUAIIACAAD2BQAggwIAABUAIAUiAADpBQAgIwAA9AUAIP8BAADqBQAggAIAAPMFACCDAgAAFQAgAyIAAPEFACD_AQAA8gUAIIMCAABQACADIgAA7wUAIP8BAADwBQAggwIAAA0AIAMiAADtBQAg_wEAAO4FACCDAgAAEQAgAyIAAOsFACD_AQAA7AUAIIMCAAAVACADIgAA6QUAIP8BAADqBQAggwIAABUAIAAAAAAAAAGFAgAAANYBAgGFAgAAANgBAgGFAgEAAAABAYUCQAAAAAEFIgAA5AUAICMAAOcFACD_AQAA5QUAIIACAADmBQAggwIAAFAAIAMiAADkBQAg_wEAAOUFACCDAgAAUAAgAAAAAAAFhQIIAAAAAYgCCAAAAAGJAggAAAABigIIAAAAAYsCCAAAAAEFhQICAAAAAYgCAgAAAAGJAgIAAAABigICAAAAAYsCAgAAAAEFIgAA2AUAICMAAOIFACD_AQAA2QUAIIACAADhBQAggwIAAA0AIAUiAADWBQAgIwAA3wUAIP8BAADXBQAggAIAAN4FACCDAgAAEQAgBSIAANQFACAjAADcBQAg_wEAANUFACCAAgAA2wUAIIMCAABQACALIgAAowMAMCMAAKgDADD_AQAApAMAMIACAAClAwAwgQIAAKcDADCCAgAApwMAMIMCAACnAwAwhAIAAKYDACCFAgAApwMAMIYCAACpAwAwhwIAAKoDADAHIgAAngMAICMAAKEDACD_AQAAnwMAIIACAACgAwAggQIAABcAIIICAAAXACCDAgAAGQAgDAUAAIEDACAHAACCAwAgCAAAgwMAIAkAAIQDACDBAQEAAAABwgEBAAAAAcMBAQAAAAHEAQEAAAABxQEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQIAAAAZACAiAACeAwAgAwAAABcAICIAAJ4DACAjAACiAwAgDgAAABcAIAUAAPwCACAHAAD9AgAgCAAA_gIAIAkAAP8CACAbAACiAwAgwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHFAQEA-AIAIccBCAD5AgAhyAECAPoCACHJAUAA-wIAIQwFAAD8AgAgBwAA_QIAIAgAAP4CACAJAAD_AgAgwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHFAQEA-AIAIccBCAD5AgAhyAECAPoCACHJAUAA-wIAIQwFAACBAwAgBwAAggMAIAgAAIMDACAKAACFAwAgwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAcYBAQAAAAHHAQgAAAAByAECAAAAAckBQAAAAAECAAAAGQAgIgAArgMAIAMAAAAZACAiAACuAwAgIwAArQMAIAEbAADaBQAwEQUAAMYCACAHAADjAgAgCAAA5AIAIAkAAOUCACAKAADlAgAgvgEAAOECADC_AQAAFwAQwAEAAOECADDBAQEAAAABwgEBAMwCACHDAQEAzAIAIcQBAQDMAgAhxQEBAMwCACHGAQEAAAABxwEIAOICACHIAQIA3wIAIckBQADFAgAhAgAAABkAIBsAAK0DACACAAAAqwMAIBsAAKwDACAMvgEAAKoDADC_AQAAqwMAEMABAACqAwAwwQEBAMwCACHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHFAQEAzAIAIcYBAQDMAgAhxwEIAOICACHIAQIA3wIAIckBQADFAgAhDL4BAACqAwAwvwEAAKsDABDAAQAAqgMAMMEBAQDMAgAhwgEBAMwCACHDAQEAzAIAIcQBAQDMAgAhxQEBAMwCACHGAQEAzAIAIccBCADiAgAhyAECAN8CACHJAUAAxQIAIQjBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHEAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhDAUAAPwCACAHAAD9AgAgCAAA_gIAIAoAAIADACDBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHEAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhDAUAAIEDACAHAACCAwAgCAAAgwMAIAoAAIUDACDBAQEAAAABwgEBAAAAAcMBAQAAAAHEAQEAAAABxgEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQMiAADYBQAg_wEAANkFACCDAgAADQAgAyIAANYFACD_AQAA1wUAIIMCAAARACADIgAA1AUAIP8BAADVBQAggwIAAFAAIAQiAACjAwAw_wEAAKQDADCDAgAApwMAMIQCAACmAwAgAyIAAJ4DACD_AQAAnwMAIIMCAAAZACAAAAAFIgAAygUAICMAANIFACD_AQAAywUAIIACAADRBQAggwIAAAUAIAUiAADIBQAgIwAAzwUAIP8BAADJBQAggAIAAM4FACCDAgAADQAgCyIAAMQDADAjAADJAwAw_wEAAMUDADCAAgAAxgMAMIECAADIAwAwggIAAMgDADCDAgAAyAMAMIQCAADHAwAghQIAAMgDADCGAgAAygMAMIcCAADLAwAwCyIAALsDADAjAAC_AwAw_wEAALwDADCAAgAAvQMAMIECAACnAwAwggIAAKcDADCDAgAApwMAMIQCAAC-AwAghQIAAKcDADCGAgAAwAMAMIcCAACqAwAwDAUAAIEDACAHAACCAwAgCQAAhAMAIAoAAIUDACDBAQEAAAABwgEBAAAAAcMBAQAAAAHFAQEAAAABxgEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQIAAAAZACAiAADDAwAgAwAAABkAICIAAMMDACAjAADCAwAgARsAAM0FADACAAAAGQAgGwAAwgMAIAIAAACrAwAgGwAAwQMAIAjBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHFAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhDAUAAPwCACAHAAD9AgAgCQAA_wIAIAoAAIADACDBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHFAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhDAUAAIEDACAHAACCAwAgCQAAhAMAIAoAAIUDACDBAQEAAAABwgEBAAAAAcMBAQAAAAHFAQEAAAABxgEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQsFAACxAwAgBwAArwMAIAsAALIDACAMAACzAwAgwQEBAAAAAcIBAQAAAAHDAQEAAAAB5AECAAAAAeUBCAAAAAHmAQIAAAAB5wFAAAAAAQIAAAAVACAiAADPAwAgAwAAABUAICIAAM8DACAjAADOAwAgARsAAMwFADARBQAAxgIAIAcAAOMCACAIAADkAgAgCwAA0wIAIAwAAOoCACC-AQAA5wIAML8BAAATABDAAQAA5wIAMMEBAQAAAAHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHkAQIA3wIAIeUBCADoAgAh5gECAOkCACHnAUAAxQIAIfwBAADmAgAgAgAAABUAIBsAAM4DACACAAAAzAMAIBsAAM0DACALvgEAAMsDADC_AQAAzAMAEMABAADLAwAwwQEBAMwCACHCAQEAzAIAIcMBAQDMAgAhxAEBAMwCACHkAQIA3wIAIeUBCADoAgAh5gECAOkCACHnAUAAxQIAIQu-AQAAywMAML8BAADMAwAQwAEAAMsDADDBAQEAzAIAIcIBAQDMAgAhwwEBAMwCACHEAQEAzAIAIeQBAgDfAgAh5QEIAOgCACHmAQIA6QIAIecBQADFAgAhB8EBAQD4AgAhwgEBAPgCACHDAQEA-AIAIeQBAgD6AgAh5QEIAJcDACHmAQIAmAMAIecBQAD7AgAhCwUAAJsDACAHAACZAwAgCwAAnAMAIAwAAJ0DACDBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHkAQIA-gIAIeUBCACXAwAh5gECAJgDACHnAUAA-wIAIQsFAACxAwAgBwAArwMAIAsAALIDACAMAACzAwAgwQEBAAAAAcIBAQAAAAHDAQEAAAAB5AECAAAAAeUBCAAAAAHmAQIAAAAB5wFAAAAAAQMiAADKBQAg_wEAAMsFACCDAgAABQAgAyIAAMgFACD_AQAAyQUAIIMCAAANACAEIgAAxAMAMP8BAADFAwAwgwIAAMgDADCEAgAAxwMAIAQiAAC7AwAw_wEAALwDADCDAgAApwMAMIQCAAC-AwAgAAAABSIAAL0FACAjAADGBQAg_wEAAL4FACCAAgAAxQUAIIMCAAAJACAFIgAAuwUAICMAAMMFACD_AQAAvAUAIIACAADCBQAggwIAAFAAIAsiAADuAwAwIwAA8wMAMP8BAADvAwAwgAIAAPADADCBAgAA8gMAMIICAADyAwAwgwIAAPIDADCEAgAA8QMAIIUCAADyAwAwhgIAAPQDADCHAgAA9QMAMAsiAADlAwAwIwAA6QMAMP8BAADmAwAwgAIAAOcDADCBAgAAyAMAMIICAADIAwAwgwIAAMgDADCEAgAA6AMAIIUCAADIAwAwhgIAAOoDADCHAgAAywMAMAsiAADcAwAwIwAA4AMAMP8BAADdAwAwgAIAAN4DADCBAgAApwMAMIICAACnAwAwgwIAAKcDADCEAgAA3wMAIIUCAACnAwAwhgIAAOEDADCHAgAAqgMAMAwFAACBAwAgCAAAgwMAIAkAAIQDACAKAACFAwAgwQEBAAAAAcIBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQgAAAAByAECAAAAAckBQAAAAAECAAAAGQAgIgAA5AMAIAMAAAAZACAiAADkAwAgIwAA4wMAIAEbAADBBQAwAgAAABkAIBsAAOMDACACAAAAqwMAIBsAAOIDACAIwQEBAPgCACHCAQEA-AIAIcQBAQD4AgAhxQEBAPgCACHGAQEA-AIAIccBCAD5AgAhyAECAPoCACHJAUAA-wIAIQwFAAD8AgAgCAAA_gIAIAkAAP8CACAKAACAAwAgwQEBAPgCACHCAQEA-AIAIcQBAQD4AgAhxQEBAPgCACHGAQEA-AIAIccBCAD5AgAhyAECAPoCACHJAUAA-wIAIQwFAACBAwAgCAAAgwMAIAkAAIQDACAKAACFAwAgwQEBAAAAAcIBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQgAAAAByAECAAAAAckBQAAAAAELBQAAsQMAIAgAALADACALAACyAwAgDAAAswMAIMEBAQAAAAHCAQEAAAABxAEBAAAAAeQBAgAAAAHlAQgAAAAB5gECAAAAAecBQAAAAAECAAAAFQAgIgAA7QMAIAMAAAAVACAiAADtAwAgIwAA7AMAIAEbAADABQAwAgAAABUAIBsAAOwDACACAAAAzAMAIBsAAOsDACAHwQEBAPgCACHCAQEA-AIAIcQBAQD4AgAh5AECAPoCACHlAQgAlwMAIeYBAgCYAwAh5wFAAPsCACELBQAAmwMAIAgAAJoDACALAACcAwAgDAAAnQMAIMEBAQD4AgAhwgEBAPgCACHEAQEA-AIAIeQBAgD6AgAh5QEIAJcDACHmAQIAmAMAIecBQAD7AgAhCwUAALEDACAIAACwAwAgCwAAsgMAIAwAALMDACDBAQEAAAABwgEBAAAAAcQBAQAAAAHkAQIAAAAB5QEIAAAAAeYBAgAAAAHnAUAAAAABBwYAANADACAOAADSAwAgDwAA0wMAIMEBAQAAAAHJAUAAAAAB6AEBAAAAAekBgAAAAAECAAAAEQAgIgAA-QMAIAMAAAARACAiAAD5AwAgIwAA-AMAIAEbAAC_BQAwDAYAAOwCACAHAADjAgAgDgAA0QIAIA8AANMCACC-AQAA6wIAML8BAAAPABDAAQAA6wIAMMEBAQAAAAHDAQEAzAIAIckBQADFAgAh6AEBAMwCACHpAQAAxAIAIAIAAAARACAbAAD4AwAgAgAAAPYDACAbAAD3AwAgCL4BAAD1AwAwvwEAAPYDABDAAQAA9QMAMMEBAQDMAgAhwwEBAMwCACHJAUAAxQIAIegBAQDMAgAh6QEAAMQCACAIvgEAAPUDADC_AQAA9gMAEMABAAD1AwAwwQEBAMwCACHDAQEAzAIAIckBQADFAgAh6AEBAMwCACHpAQAAxAIAIATBAQEA-AIAIckBQAD7AgAh6AEBAPgCACHpAYAAAAABBwYAALcDACAOAAC5AwAgDwAAugMAIMEBAQD4AgAhyQFAAPsCACHoAQEA-AIAIekBgAAAAAEHBgAA0AMAIA4AANIDACAPAADTAwAgwQEBAAAAAckBQAAAAAHoAQEAAAAB6QGAAAAAAQMiAAC9BQAg_wEAAL4FACCDAgAACQAgAyIAALsFACD_AQAAvAUAIIMCAABQACAEIgAA7gMAMP8BAADvAwAwgwIAAPIDADCEAgAA8QMAIAQiAADlAwAw_wEAAOYDADCDAgAAyAMAMIQCAADoAwAgBCIAANwDADD_AQAA3QMAMIMCAACnAwAwhAIAAN8DACAAAAAFIgAAsgUAICMAALkFACD_AQAAswUAIIACAAC4BQAggwIAAAkAIAUiAACwBQAgIwAAtgUAIP8BAACxBQAggAIAALUFACCDAgAAAQAgCyIAAIUEADAjAACJBAAw_wEAAIYEADCAAgAAhwQAMIECAADyAwAwggIAAPIDADCDAgAA8gMAMIQCAACIBAAghQIAAPIDADCGAgAAigQAMIcCAAD1AwAwBwcAANEDACAOAADSAwAgDwAA0wMAIMEBAQAAAAHDAQEAAAAByQFAAAAAAekBgAAAAAECAAAAEQAgIgAAjQQAIAMAAAARACAiAACNBAAgIwAAjAQAIAEbAAC0BQAwAgAAABEAIBsAAIwEACACAAAA9gMAIBsAAIsEACAEwQEBAPgCACHDAQEA-AIAIckBQAD7AgAh6QGAAAAAAQcHAAC4AwAgDgAAuQMAIA8AALoDACDBAQEA-AIAIcMBAQD4AgAhyQFAAPsCACHpAYAAAAABBwcAANEDACAOAADSAwAgDwAA0wMAIMEBAQAAAAHDAQEAAAAByQFAAAAAAekBgAAAAAEDIgAAsgUAIP8BAACzBQAggwIAAAkAIAMiAACwBQAg_wEAALEFACCDAgAAAQAgBCIAAIUEADD_AQAAhgQAMIMCAADyAwAwhAIAAIgEACAAAAAFIgAAqQUAICMAAK4FACD_AQAAqgUAIIACAACtBQAggwIAAFAAIAsiAACjBAAwIwAAqAQAMP8BAACkBAAwgAIAAKUEADCBAgAApwQAMIICAACnBAAwgwIAAKcEADCEAgAApgQAIIUCAACnBAAwhgIAAKkEADCHAgAAqgQAMAsiAACXBAAwIwAAnAQAMP8BAACYBAAwgAIAAJkEADCBAgAAmwQAMIICAACbBAAwgwIAAJsEADCEAgAAmgQAIIUCAACbBAAwhgIAAJ0EADCHAgAAngQAMAgFAAD7AwAgDgAA_QMAIA8AAP4DACAQAAD8AwAgwQEBAAAAAcIBAQAAAAHrAUAAAAAB7AFAAAAAAQIAAAANACAiAACiBAAgAwAAAA0AICIAAKIEACAjAAChBAAgARsAAKwFADANBAAA7gIAIAUAAMYCACAOAADRAgAgDwAA0wIAIBAAAO8CACC-AQAA7QIAML8BAAALABDAAQAA7QIAMMEBAQAAAAHCAQEAzAIAIeoBAQDMAgAh6wFAAMUCACHsAUAAzgIAIQIAAAANACAbAAChBAAgAgAAAJ8EACAbAACgBAAgCL4BAACeBAAwvwEAAJ8EABDAAQAAngQAMMEBAQDMAgAhwgEBAMwCACHqAQEAzAIAIesBQADFAgAh7AFAAM4CACEIvgEAAJ4EADC_AQAAnwQAEMABAACeBAAwwQEBAMwCACHCAQEAzAIAIeoBAQDMAgAh6wFAAMUCACHsAUAAzgIAIQTBAQEA-AIAIcIBAQD4AgAh6wFAAPsCACHsAUAAjwMAIQgFAADYAwAgDgAA2gMAIA8AANsDACAQAADZAwAgwQEBAPgCACHCAQEA-AIAIesBQAD7AgAh7AFAAI8DACEIBQAA-wMAIA4AAP0DACAPAAD-AwAgEAAA_AMAIMEBAQAAAAHCAQEAAAAB6wFAAAAAAewBQAAAAAEHEAAAkAQAIBUAAI8EACDBAQEAAAAByQFAAAAAAe0BAQAAAAHuAQEAAAAB7wFAAAAAAQIAAAAFACAiAACuBAAgAwAAAAUAICIAAK4EACAjAACtBAAgARsAAKsFADAMBAAA7gIAIBAAAO8CACAVAADyAgAgvgEAAPECADC_AQAAAwAQwAEAAPECADDBAQEAAAAByQFAAMUCACHqAQEAzAIAIe0BAQDMAgAh7gEBAMwCACHvAUAAzgIAIQIAAAAFACAbAACtBAAgAgAAAKsEACAbAACsBAAgCb4BAACqBAAwvwEAAKsEABDAAQAAqgQAMMEBAQDMAgAhyQFAAMUCACHqAQEAzAIAIe0BAQDMAgAh7gEBAMwCACHvAUAAzgIAIQm-AQAAqgQAML8BAACrBAAQwAEAAKoEADDBAQEAzAIAIckBQADFAgAh6gEBAMwCACHtAQEAzAIAIe4BAQDMAgAh7wFAAM4CACEFwQEBAPgCACHJAUAA-wIAIe0BAQD4AgAh7gEBAPgCACHvAUAAjwMAIQcQAACEBAAgFQAAgwQAIMEBAQD4AgAhyQFAAPsCACHtAQEA-AIAIe4BAQD4AgAh7wFAAI8DACEHEAAAkAQAIBUAAI8EACDBAQEAAAAByQFAAAAAAe0BAQAAAAHuAQEAAAAB7wFAAAAAAQMiAACpBQAg_wEAAKoFACCDAgAAUAAgBCIAAKMEADD_AQAApAQAMIMCAACnBAAwhAIAAKYEACAEIgAAlwQAMP8BAACYBAAwgwIAAJsEADCEAgAAmgQAIAAAAAUiAACkBQAgIwAApwUAIP8BAAClBQAggAIAAKYFACCDAgAAUAAgAyIAAKQFACD_AQAApQUAIIMCAABQACAHAwAAgAUAIA4AAIIFACAPAACEBQAgEQAAgQUAIBIAAIMFACATAACFBQAg7wEAAIYDACAAAAABhQIAAAD0AQILIgAA7gQAMCMAAPMEADD_AQAA7wQAMIACAADwBAAwgQIAAPIEADCCAgAA8gQAMIMCAADyBAAwhAIAAPEEACCFAgAA8gQAMIYCAAD0BAAwhwIAAPUEADALIgAA5QQAMCMAAOkEADD_AQAA5gQAMIACAADnBAAwgQIAAJsEADCCAgAAmwQAMIMCAACbBAAwhAIAAOgEACCFAgAAmwQAMIYCAADqBAAwhwIAAJ4EADALIgAA3AQAMCMAAOAEADD_AQAA3QQAMIACAADeBAAwgQIAAMgDADCCAgAAyAMAMIMCAADIAwAwhAIAAN8EACCFAgAAyAMAMIYCAADhBAAwhwIAAMsDADALIgAA0AQAMCMAANUEADD_AQAA0QQAMIACAADSBAAwgQIAANQEADCCAgAA1AQAMIMCAADUBAAwhAIAANMEACCFAgAA1AQAMIYCAADWBAAwhwIAANcEADALIgAAxwQAMCMAAMsEADD_AQAAyAQAMIACAADJBAAwgQIAAKcDADCCAgAApwMAMIMCAACnAwAwhAIAAMoEACCFAgAApwMAMIYCAADMBAAwhwIAAKoDADAHIgAAwgQAICMAAMUEACD_AQAAwwQAIIACAADEBAAggQIAACsAIIICAAArACCDAgAAaQAgBBOAAAAAAcEBAQAAAAHJAUAAAAAB3AFAAAAAAQIAAABpACAiAADCBAAgAwAAACsAICIAAMIEACAjAADGBAAgBgAAACsAIBOAAAAAARsAAMYEACDBAQEA-AIAIckBQAD7AgAh3AFAAPsCACEEE4AAAAABwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAhDAcAAIIDACAIAACDAwAgCQAAhAMAIAoAAIUDACDBAQEAAAABwwEBAAAAAcQBAQAAAAHFAQEAAAABxgEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQIAAAAZACAiAADPBAAgAwAAABkAICIAAM8EACAjAADOBAAgARsAAKMFADACAAAAGQAgGwAAzgQAIAIAAACrAwAgGwAAzQQAIAjBAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHFAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhDAcAAP0CACAIAAD-AgAgCQAA_wIAIAoAAIADACDBAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHFAQEA-AIAIcYBAQD4AgAhxwEIAPkCACHIAQIA-gIAIckBQAD7AgAhDAcAAIIDACAIAACDAwAgCQAAhAMAIAoAAIUDACDBAQEAAAABwwEBAAAAAcQBAQAAAAHFAQEAAAABxgEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQnBAQEAAAAByQFAAAAAAdYBAAAA1gEC2AEAAADYAQLZAYAAAAAB2gECAAAAAdsBAQAAAAHcAUAAAAAB3QFAAAAAAQIAAAAoACAiAADbBAAgAwAAACgAICIAANsEACAjAADaBAAgARsAAKIFADAOBQAAxgIAIL4BAADcAgAwvwEAACYAEMABAADcAgAwwQEBAAAAAcIBAQDMAgAhyQFAAMUCACHWAQAA3QLWASLYAQAA3gLYASLZAQAAxAIAINoBAgDfAgAh2wEBAOACACHcAUAAxQIAId0BQADOAgAhAgAAACgAIBsAANoEACACAAAA2AQAIBsAANkEACANvgEAANcEADC_AQAA2AQAEMABAADXBAAwwQEBAMwCACHCAQEAzAIAIckBQADFAgAh1gEAAN0C1gEi2AEAAN4C2AEi2QEAAMQCACDaAQIA3wIAIdsBAQDgAgAh3AFAAMUCACHdAUAAzgIAIQ2-AQAA1wQAML8BAADYBAAQwAEAANcEADDBAQEAzAIAIcIBAQDMAgAhyQFAAMUCACHWAQAA3QLWASLYAQAA3gLYASLZAQAAxAIAINoBAgDfAgAh2wEBAOACACHcAUAAxQIAId0BQADOAgAhCcEBAQD4AgAhyQFAAPsCACHWAQAAjAPWASLYAQAAjQPYASLZAYAAAAAB2gECAPoCACHbAQEAjgMAIdwBQAD7AgAh3QFAAI8DACEJwQEBAPgCACHJAUAA-wIAIdYBAACMA9YBItgBAACNA9gBItkBgAAAAAHaAQIA-gIAIdsBAQCOAwAh3AFAAPsCACHdAUAAjwMAIQnBAQEAAAAByQFAAAAAAdYBAAAA1gEC2AEAAADYAQLZAYAAAAAB2gECAAAAAdsBAQAAAAHcAUAAAAAB3QFAAAAAAQsHAACvAwAgCAAAsAMAIAsAALIDACAMAACzAwAgwQEBAAAAAcMBAQAAAAHEAQEAAAAB5AECAAAAAeUBCAAAAAHmAQIAAAAB5wFAAAAAAQIAAAAVACAiAADkBAAgAwAAABUAICIAAOQEACAjAADjBAAgARsAAKEFADACAAAAFQAgGwAA4wQAIAIAAADMAwAgGwAA4gQAIAfBAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHkAQIA-gIAIeUBCACXAwAh5gECAJgDACHnAUAA-wIAIQsHAACZAwAgCAAAmgMAIAsAAJwDACAMAACdAwAgwQEBAPgCACHDAQEA-AIAIcQBAQD4AgAh5AECAPoCACHlAQgAlwMAIeYBAgCYAwAh5wFAAPsCACELBwAArwMAIAgAALADACALAACyAwAgDAAAswMAIMEBAQAAAAHDAQEAAAABxAEBAAAAAeQBAgAAAAHlAQgAAAAB5gECAAAAAecBQAAAAAEIBAAA-gMAIA4AAP0DACAPAAD-AwAgEAAA_AMAIMEBAQAAAAHqAQEAAAAB6wFAAAAAAewBQAAAAAECAAAADQAgIgAA7QQAIAMAAAANACAiAADtBAAgIwAA7AQAIAEbAACgBQAwAgAAAA0AIBsAAOwEACACAAAAnwQAIBsAAOsEACAEwQEBAPgCACHqAQEA-AIAIesBQAD7AgAh7AFAAI8DACEIBAAA1wMAIA4AANoDACAPAADbAwAgEAAA2QMAIMEBAQD4AgAh6gEBAPgCACHrAUAA-wIAIewBQACPAwAhCAQAAPoDACAOAAD9AwAgDwAA_gMAIBAAAPwDACDBAQEAAAAB6gEBAAAAAesBQAAAAAHsAUAAAAABBxEAALEEACAUAACwBAAgwQEBAAAAAckBQAAAAAHcAUAAAAAB7gEBAAAAAe8BQAAAAAECAAAACQAgIgAA-QQAIAMAAAAJACAiAAD5BAAgIwAA-AQAIAEbAACfBQAwDAUAAMYCACARAADQAgAgFAAA2wIAIL4BAADwAgAwvwEAAAcAEMABAADwAgAwwQEBAAAAAcIBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe4BAQDMAgAh7wFAAM4CACECAAAACQAgGwAA-AQAIAIAAAD2BAAgGwAA9wQAIAm-AQAA9QQAML8BAAD2BAAQwAEAAPUEADDBAQEAzAIAIcIBAQDMAgAhyQFAAMUCACHcAUAAxQIAIe4BAQDMAgAh7wFAAM4CACEJvgEAAPUEADC_AQAA9gQAEMABAAD1BAAwwQEBAMwCACHCAQEAzAIAIckBQADFAgAh3AFAAMUCACHuAQEAzAIAIe8BQADOAgAhBcEBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh7wFAAI8DACEHEQAAlgQAIBQAAJUEACDBAQEA-AIAIckBQAD7AgAh3AFAAPsCACHuAQEA-AIAIe8BQACPAwAhBxEAALEEACAUAACwBAAgwQEBAAAAAckBQAAAAAHcAUAAAAAB7gEBAAAAAe8BQAAAAAEEIgAA7gQAMP8BAADvBAAwgwIAAPIEADCEAgAA8QQAIAQiAADlBAAw_wEAAOYEADCDAgAAmwQAMIQCAADoBAAgBCIAANwEADD_AQAA3QQAMIMCAADIAwAwhAIAAN8EACAEIgAA0AQAMP8BAADRBAAwgwIAANQEADCEAgAA0wQAIAQiAADHBAAw_wEAAMgEADCDAgAApwMAMIQCAADKBAAgAyIAAMIEACD_AQAAwwQAIIMCAABpACAAAAAAAAEFAAC3BAAgAAAAAYUCAAAA-gECCyIAAIsFADAjAACPBQAw_wEAAIwFADCAAgAAjQUAMIECAACnBAAwggIAAKcEADCDAgAApwQAMIQCAACOBQAghQIAAKcEADCGAgAAkAUAMIcCAACqBAAwBwQAAI4EACAQAACQBAAgwQEBAAAAAckBQAAAAAHqAQEAAAAB7gEBAAAAAe8BQAAAAAECAAAABQAgIgAAkwUAIAMAAAAFACAiAACTBQAgIwAAkgUAIAEbAACeBQAwAgAAAAUAIBsAAJIFACACAAAAqwQAIBsAAJEFACAFwQEBAPgCACHJAUAA-wIAIeoBAQD4AgAh7gEBAPgCACHvAUAAjwMAIQcEAACCBAAgEAAAhAQAIMEBAQD4AgAhyQFAAPsCACHqAQEA-AIAIe4BAQD4AgAh7wFAAI8DACEHBAAAjgQAIBAAAJAEACDBAQEAAAAByQFAAAAAAeoBAQAAAAHuAQEAAAAB7wFAAAAAAQQiAACLBQAw_wEAAIwFADCDAgAApwQAMIQCAACOBQAgAAYEAACbBQAgBQAAtwQAIA4AAIIFACAPAACEBQAgEAAAnAUAIOwBAACGAwAgBAYAAJoFACAHAACWBQAgDgAAggUAIA8AAIQFACAHBQAAtwQAIAcAAJYFACAIAACXBQAgCwAAhAUAIAwAAJkFACDlAQAAhgMAIOYBAACGAwAgBQUAALcEACAHAACWBQAgCAAAlwUAIAkAAJgFACAKAACYBQAgBAQAAJsFACAQAACcBQAgFQAAnQUAIO8BAACGAwAgBAUAALcEACARAACBBQAgFAAAlQUAIO8BAACGAwAgAAEUAACVBQAgBcEBAQAAAAHJAUAAAAAB6gEBAAAAAe4BAQAAAAHvAUAAAAABBcEBAQAAAAHJAUAAAAAB3AFAAAAAAe4BAQAAAAHvAUAAAAABBMEBAQAAAAHqAQEAAAAB6wFAAAAAAewBQAAAAAEHwQEBAAAAAcMBAQAAAAHEAQEAAAAB5AECAAAAAeUBCAAAAAHmAQIAAAAB5wFAAAAAAQnBAQEAAAAByQFAAAAAAdYBAAAA1gEC2AEAAADYAQLZAYAAAAAB2gECAAAAAdsBAQAAAAHcAUAAAAAB3QFAAAAAAQjBAQEAAAABwwEBAAAAAcQBAQAAAAHFAQEAAAABxgEBAAAAAccBCAAAAAHIAQIAAAAByQFAAAAAAQ0DAAD6BAAgDgAA_AQAIA8AAP4EACARAAD7BAAgEgAA_QQAIMEBAQAAAAHJAUAAAAAB3AFAAAAAAe8BQAAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAH0AQAAAPQBAgIAAABQACAiAACkBQAgAwAAAFMAICIAAKQFACAjAACoBQAgDwAAAFMAIAMAALwEACAOAAC-BAAgDwAAwAQAIBEAAL0EACASAAC_BAAgGwAAqAUAIMEBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe8BQACPAwAh8AEBAPgCACHxAQEA-AIAIfIBAQD4AgAh9AEAALsE9AEiDQMAALwEACAOAAC-BAAgDwAAwAQAIBEAAL0EACASAAC_BAAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASINDgAA_AQAIA8AAP4EACARAAD7BAAgEgAA_QQAIBMAAP8EACDBAQEAAAAByQFAAAAAAdwBQAAAAAHvAUAAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB9AEAAAD0AQICAAAAUAAgIgAAqQUAIAXBAQEAAAAByQFAAAAAAe0BAQAAAAHuAQEAAAAB7wFAAAAAAQTBAQEAAAABwgEBAAAAAesBQAAAAAHsAUAAAAABAwAAAFMAICIAAKkFACAjAACvBQAgDwAAAFMAIA4AAL4EACAPAADABAAgEQAAvQQAIBIAAL8EACATAADBBAAgGwAArwUAIMEBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe8BQACPAwAh8AEBAPgCACHxAQEA-AIAIfIBAQD4AgAh9AEAALsE9AEiDQ4AAL4EACAPAADABAAgEQAAvQQAIBIAAL8EACATAADBBAAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASIHwQEBAAAAAckBQAAAAAHcAUAAAAAB7gEBAAAAAfgBAQAAAAH6AQAAAPoBAvsBAQAAAAECAAAAAQAgIgAAsAUAIAgFAACvBAAgEQAAsQQAIMEBAQAAAAHCAQEAAAAByQFAAAAAAdwBQAAAAAHuAQEAAAAB7wFAAAAAAQIAAAAJACAiAACyBQAgBMEBAQAAAAHDAQEAAAAByQFAAAAAAekBgAAAAAEDAAAAOgAgIgAAsAUAICMAALcFACAJAAAAOgAgGwAAtwUAIMEBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh-AEBAPgCACH6AQAAiQX6ASL7AQEA-AIAIQfBAQEA-AIAIckBQAD7AgAh3AFAAPsCACHuAQEA-AIAIfgBAQD4AgAh-gEAAIkF-gEi-wEBAPgCACEDAAAABwAgIgAAsgUAICMAALoFACAKAAAABwAgBQAAlAQAIBEAAJYEACAbAAC6BQAgwQEBAPgCACHCAQEA-AIAIckBQAD7AgAh3AFAAPsCACHuAQEA-AIAIe8BQACPAwAhCAUAAJQEACARAACWBAAgwQEBAPgCACHCAQEA-AIAIckBQAD7AgAh3AFAAPsCACHuAQEA-AIAIe8BQACPAwAhDQMAAPoEACAOAAD8BAAgDwAA_gQAIBIAAP0EACATAAD_BAAgwQEBAAAAAckBQAAAAAHcAUAAAAAB7wFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfQBAAAA9AECAgAAAFAAICIAALsFACAIBQAArwQAIBQAALAEACDBAQEAAAABwgEBAAAAAckBQAAAAAHcAUAAAAAB7gEBAAAAAe8BQAAAAAECAAAACQAgIgAAvQUAIATBAQEAAAAByQFAAAAAAegBAQAAAAHpAYAAAAABB8EBAQAAAAHCAQEAAAABxAEBAAAAAeQBAgAAAAHlAQgAAAAB5gECAAAAAecBQAAAAAEIwQEBAAAAAcIBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQgAAAAByAECAAAAAckBQAAAAAEDAAAAUwAgIgAAuwUAICMAAMQFACAPAAAAUwAgAwAAvAQAIA4AAL4EACAPAADABAAgEgAAvwQAIBMAAMEEACAbAADEBQAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASINAwAAvAQAIA4AAL4EACAPAADABAAgEgAAvwQAIBMAAMEEACDBAQEA-AIAIckBQAD7AgAh3AFAAPsCACHvAUAAjwMAIfABAQD4AgAh8QEBAPgCACHyAQEA-AIAIfQBAAC7BPQBIgMAAAAHACAiAAC9BQAgIwAAxwUAIAoAAAAHACAFAACUBAAgFAAAlQQAIBsAAMcFACDBAQEA-AIAIcIBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh7wFAAI8DACEIBQAAlAQAIBQAAJUEACDBAQEA-AIAIcIBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe4BAQD4AgAh7wFAAI8DACEJBAAA-gMAIAUAAPsDACAOAAD9AwAgDwAA_gMAIMEBAQAAAAHCAQEAAAAB6gEBAAAAAesBQAAAAAHsAUAAAAABAgAAAA0AICIAAMgFACAIBAAAjgQAIBUAAI8EACDBAQEAAAAByQFAAAAAAeoBAQAAAAHtAQEAAAAB7gEBAAAAAe8BQAAAAAECAAAABQAgIgAAygUAIAfBAQEAAAABwgEBAAAAAcMBAQAAAAHkAQIAAAAB5QEIAAAAAeYBAgAAAAHnAUAAAAABCMEBAQAAAAHCAQEAAAABwwEBAAAAAcUBAQAAAAHGAQEAAAABxwEIAAAAAcgBAgAAAAHJAUAAAAABAwAAAAsAICIAAMgFACAjAADQBQAgCwAAAAsAIAQAANcDACAFAADYAwAgDgAA2gMAIA8AANsDACAbAADQBQAgwQEBAPgCACHCAQEA-AIAIeoBAQD4AgAh6wFAAPsCACHsAUAAjwMAIQkEAADXAwAgBQAA2AMAIA4AANoDACAPAADbAwAgwQEBAPgCACHCAQEA-AIAIeoBAQD4AgAh6wFAAPsCACHsAUAAjwMAIQMAAAADACAiAADKBQAgIwAA0wUAIAoAAAADACAEAACCBAAgFQAAgwQAIBsAANMFACDBAQEA-AIAIckBQAD7AgAh6gEBAPgCACHtAQEA-AIAIe4BAQD4AgAh7wFAAI8DACEIBAAAggQAIBUAAIMEACDBAQEA-AIAIckBQAD7AgAh6gEBAPgCACHtAQEA-AIAIe4BAQD4AgAh7wFAAI8DACENAwAA-gQAIA8AAP4EACARAAD7BAAgEgAA_QQAIBMAAP8EACDBAQEAAAAByQFAAAAAAdwBQAAAAAHvAUAAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB9AEAAAD0AQICAAAAUAAgIgAA1AUAIAgGAADQAwAgBwAA0QMAIA8AANMDACDBAQEAAAABwwEBAAAAAckBQAAAAAHoAQEAAAAB6QGAAAAAAQIAAAARACAiAADWBQAgCQQAAPoDACAFAAD7AwAgDwAA_gMAIBAAAPwDACDBAQEAAAABwgEBAAAAAeoBAQAAAAHrAUAAAAAB7AFAAAAAAQIAAAANACAiAADYBQAgCMEBAQAAAAHCAQEAAAABwwEBAAAAAcQBAQAAAAHGAQEAAAABxwEIAAAAAcgBAgAAAAHJAUAAAAABAwAAAFMAICIAANQFACAjAADdBQAgDwAAAFMAIAMAALwEACAPAADABAAgEQAAvQQAIBIAAL8EACATAADBBAAgGwAA3QUAIMEBAQD4AgAhyQFAAPsCACHcAUAA-wIAIe8BQACPAwAh8AEBAPgCACHxAQEA-AIAIfIBAQD4AgAh9AEAALsE9AEiDQMAALwEACAPAADABAAgEQAAvQQAIBIAAL8EACATAADBBAAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASIDAAAADwAgIgAA1gUAICMAAOAFACAKAAAADwAgBgAAtwMAIAcAALgDACAPAAC6AwAgGwAA4AUAIMEBAQD4AgAhwwEBAPgCACHJAUAA-wIAIegBAQD4AgAh6QGAAAAAAQgGAAC3AwAgBwAAuAMAIA8AALoDACDBAQEA-AIAIcMBAQD4AgAhyQFAAPsCACHoAQEA-AIAIekBgAAAAAEDAAAACwAgIgAA2AUAICMAAOMFACALAAAACwAgBAAA1wMAIAUAANgDACAPAADbAwAgEAAA2QMAIBsAAOMFACDBAQEA-AIAIcIBAQD4AgAh6gEBAPgCACHrAUAA-wIAIewBQACPAwAhCQQAANcDACAFAADYAwAgDwAA2wMAIBAAANkDACDBAQEA-AIAIcIBAQD4AgAh6gEBAPgCACHrAUAA-wIAIewBQACPAwAhDQMAAPoEACAOAAD8BAAgDwAA_gQAIBEAAPsEACATAAD_BAAgwQEBAAAAAckBQAAAAAHcAUAAAAAB7wFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfQBAAAA9AECAgAAAFAAICIAAOQFACADAAAAUwAgIgAA5AUAICMAAOgFACAPAAAAUwAgAwAAvAQAIA4AAL4EACAPAADABAAgEQAAvQQAIBMAAMEEACAbAADoBQAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASINAwAAvAQAIA4AAL4EACAPAADABAAgEQAAvQQAIBMAAMEEACDBAQEA-AIAIckBQAD7AgAh3AFAAPsCACHvAUAAjwMAIfABAQD4AgAh8QEBAPgCACHyAQEA-AIAIfQBAAC7BPQBIgwFAACxAwAgBwAArwMAIAgAALADACALAACyAwAgwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAeQBAgAAAAHlAQgAAAAB5gECAAAAAecBQAAAAAECAAAAFQAgIgAA6QUAIAwFAACxAwAgBwAArwMAIAgAALADACAMAACzAwAgwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAeQBAgAAAAHlAQgAAAAB5gECAAAAAecBQAAAAAECAAAAFQAgIgAA6wUAIAgGAADQAwAgBwAA0QMAIA4AANIDACDBAQEAAAABwwEBAAAAAckBQAAAAAHoAQEAAAAB6QGAAAAAAQIAAAARACAiAADtBQAgCQQAAPoDACAFAAD7AwAgDgAA_QMAIBAAAPwDACDBAQEAAAABwgEBAAAAAeoBAQAAAAHrAUAAAAAB7AFAAAAAAQIAAAANACAiAADvBQAgDQMAAPoEACAOAAD8BAAgEQAA-wQAIBIAAP0EACATAAD_BAAgwQEBAAAAAckBQAAAAAHcAUAAAAAB7wFAAAAAAfABAQAAAAHxAQEAAAAB8gEBAAAAAfQBAAAA9AECAgAAAFAAICIAAPEFACADAAAAEwAgIgAA6QUAICMAAPUFACAOAAAAEwAgBQAAmwMAIAcAAJkDACAIAACaAwAgCwAAnAMAIBsAAPUFACDBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHEAQEA-AIAIeQBAgD6AgAh5QEIAJcDACHmAQIAmAMAIecBQAD7AgAhDAUAAJsDACAHAACZAwAgCAAAmgMAIAsAAJwDACDBAQEA-AIAIcIBAQD4AgAhwwEBAPgCACHEAQEA-AIAIeQBAgD6AgAh5QEIAJcDACHmAQIAmAMAIecBQAD7AgAhAwAAABMAICIAAOsFACAjAAD4BQAgDgAAABMAIAUAAJsDACAHAACZAwAgCAAAmgMAIAwAAJ0DACAbAAD4BQAgwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHkAQIA-gIAIeUBCACXAwAh5gECAJgDACHnAUAA-wIAIQwFAACbAwAgBwAAmQMAIAgAAJoDACAMAACdAwAgwQEBAPgCACHCAQEA-AIAIcMBAQD4AgAhxAEBAPgCACHkAQIA-gIAIeUBCACXAwAh5gECAJgDACHnAUAA-wIAIQMAAAAPACAiAADtBQAgIwAA-wUAIAoAAAAPACAGAAC3AwAgBwAAuAMAIA4AALkDACAbAAD7BQAgwQEBAPgCACHDAQEA-AIAIckBQAD7AgAh6AEBAPgCACHpAYAAAAABCAYAALcDACAHAAC4AwAgDgAAuQMAIMEBAQD4AgAhwwEBAPgCACHJAUAA-wIAIegBAQD4AgAh6QGAAAAAAQMAAAALACAiAADvBQAgIwAA_gUAIAsAAAALACAEAADXAwAgBQAA2AMAIA4AANoDACAQAADZAwAgGwAA_gUAIMEBAQD4AgAhwgEBAPgCACHqAQEA-AIAIesBQAD7AgAh7AFAAI8DACEJBAAA1wMAIAUAANgDACAOAADaAwAgEAAA2QMAIMEBAQD4AgAhwgEBAPgCACHqAQEA-AIAIesBQAD7AgAh7AFAAI8DACEDAAAAUwAgIgAA8QUAICMAAIEGACAPAAAAUwAgAwAAvAQAIA4AAL4EACARAAC9BAAgEgAAvwQAIBMAAMEEACAbAACBBgAgwQEBAPgCACHJAUAA-wIAIdwBQAD7AgAh7wFAAI8DACHwAQEA-AIAIfEBAQD4AgAh8gEBAPgCACH0AQAAuwT0ASINAwAAvAQAIA4AAL4EACARAAC9BAAgEgAAvwQAIBMAAMEEACDBAQEA-AIAIckBQAD7AgAh3AFAAPsCACHvAUAAjwMAIfABAQD4AgAh8QEBAPgCACHyAQEA-AIAIfQBAAC7BPQBIgINABEUBgIEBAADDQAQEDYGFQABBAUABA0ADxEzBRQyAgcDCgMNAA4OJQcPKggRDgUSKQwTLA0GBAADBQAEDQALDiAHDyEIEBIGBQYAAgcABQ0ACg4WBw8dCAYFAAQHAAUIAAYLGggMGwgNAAkFBQAEBwAFCAAGCQAHCgAHAQscAAIOHgAPHwADDiMADyQAECIAAQUABAEFAAQFAy0ADi8ADzEAES4AEjAAAhE1ABQ0AAEQNwABFDgAAAAAAw0AFigAFykAGAAAAAMNABYoABcpABgAAAMNAB0oAB4pAB8AAAADDQAdKAAeKQAfAQUABAEFAAQDDQAkKAAlKQAmAAAAAw0AJCgAJSkAJgEFAAQBBQAEAw0AKygALCkALQAAAAMNACsoACwpAC0CBAADFQABAgQAAxUAAQMNADIoADMpADQAAAADDQAyKAAzKQA0AgQAAwUABAIEAAMFAAQDDQA5KAA6KQA7AAAAAw0AOSgAOikAOwIGAAIHAAUCBgACBwAFAw0AQCgAQSkAQgAAAAMNAEAoAEEpAEIDBQAEBwAFCAAGAwUABAcABQgABgUNAEcoAEopAEuaAQBImwEASQAAAAAABQ0ARygASikAS5oBAEibAQBJAQUABAEFAAQFDQBQKABTKQBUmgEAUZsBAFIAAAAAAAUNAFAoAFMpAFSaAQBRmwEAUgUFAAQHAAUIAAYJAAcKAAcFBQAEBwAFCAAGCQAHCgAHBQ0AWSgAXCkAXZoBAFqbAQBbAAAAAAAFDQBZKABcKQBdmgEAWpsBAFsWAgEXOQEYPAEZPQEaPgEcQAEdQhIeQxMfRQEgRxIhSBQkSQElSgEmSxIqThUrTxksUQQtUgQuVQQvVgQwVwQxWQQyWxIzXBo0XgQ1YBI2YRs3YgQ4YwQ5ZBI6Zxw7aCA8ag09aw0-bQ0_bg1Abw1BcQ1CcxJDdCFEdg1FeBJGeSJHeg1Iew1JfBJKfyNLgAEnTIEBA02CAQNOgwEDT4QBA1CFAQNRhwEDUokBElOKAShUjAEDVY4BElaPASlXkAEDWJEBA1mSARJalQEqW5YBLlyXAQJdmAECXpkBAl-aAQJgmwECYZ0BAmKfARJjoAEvZKIBAmWkARJmpQEwZ6YBAminAQJpqAESaqsBMWusATVsrQEFba4BBW6vAQVvsAEFcLEBBXGzAQVytQESc7YBNnS4AQV1ugESdrsBN3e8AQV4vQEFeb4BEnrBATh7wgE8fMMBBn3EAQZ-xQEGf8YBBoABxwEGgQHJAQaCAcsBEoMBzAE9hAHOAQaFAdABEoYB0QE-hwHSAQaIAdMBBokB1AESigHXAT-LAdgBQ4wB2QEHjQHaAQeOAdsBB48B3AEHkAHdAQeRAd8BB5IB4QESkwHiAUSUAeQBB5UB5gESlgHnAUWXAegBB5gB6QEHmQHqARKcAe0BRp0B7gFMngHvAQyfAfABDKAB8QEMoQHyAQyiAfMBDKMB9QEMpAH3ARKlAfgBTaYB-gEMpwH8ARKoAf0BTqkB_gEMqgH_AQyrAYACEqwBgwJPrQGEAlWuAYUCCK8BhgIIsAGHAgixAYgCCLIBiQIIswGLAgi0AY0CErUBjgJWtgGQAgi3AZICErgBkwJXuQGUAgi6AZUCCLsBlgISvAGZAli9AZoCXg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var runtime2 = __toESM(require("@prisma/client/runtime/client"));
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
var import_meta = {};
globalThis["__dirname"] = path.dirname((0, import_node_url.fileURLToPath)(import_meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var isDev = env.NODE_ENV === "dev";
var schema = new URL(env.DATABASE_URL).searchParams.get("schema") ?? void 0;
var adapter = new import_adapter_pg.PrismaPg(
  { connectionString: env.DATABASE_URL },
  schema ? { schema } : void 0
);
var prisma = new PrismaClient({
  adapter,
  log: isDev ? ["query"] : []
});

// src/repositories/prisma/prisma-default-exercises-repository.ts
var PAGE_SIZE = 20;
var PrismaDefaultExercisesRepository = class {
  async findMany({ query, muscleGroup, page }) {
    const where = {
      ...query ? { title: { contains: query, mode: "insensitive" } } : {},
      ...muscleGroup ? { muscle_group: muscleGroup } : {}
    };
    const [exercises, total] = await Promise.all([
      prisma.defaultExercise.findMany({
        where,
        orderBy: { title: "asc" },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE
      }),
      prisma.defaultExercise.count({ where })
    ]);
    return { exercises, total };
  }
  async findById(id) {
    return prisma.defaultExercise.findUnique({ where: { id } });
  }
  async findBySlug(slug) {
    return prisma.defaultExercise.findUnique({ where: { slug } });
  }
  async create(data) {
    return prisma.defaultExercise.create({ data });
  }
};

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

// src/use-cases/_factories/make-create-exercise-use-case.ts
function makeCreateExerciseUseCase() {
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository();
  return new CreateExerciseUseCase(defaultExercisesRepository);
}

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

// src/http/controllers/catalog-exercises/create-exercise/create-exercise.ts
async function createExercise(request, reply) {
  const createExerciseBodySchema = import_zod2.z.object({
    title: import_zod2.z.string().min(1),
    muscleGroup: import_zod2.z.enum([
      "CHEST",
      "BACK",
      "SHOULDERS",
      "BICEPS",
      "TRICEPS",
      "FOREARMS",
      "CORE",
      "QUADS",
      "HAMSTRINGS",
      "GLUTES",
      "CALVES",
      "FULL_BODY"
    ]),
    slug: import_zod2.z.string().min(1).optional(),
    imagePath: import_zod2.z.string().min(1)
  });
  const { title, muscleGroup, slug, imagePath } = createExerciseBodySchema.parse(request.body);
  try {
    const createExerciseUseCase = makeCreateExerciseUseCase();
    const { exercise } = await createExerciseUseCase.execute({
      title,
      muscleGroup,
      imagePath,
      ...slug ? { slug } : {}
    });
    return reply.status(201).send({ exercise: catalogExerciseToHTTP(exercise) });
  } catch (err) {
    if (err instanceof ExerciseAlreadyExistsError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/catalog-exercises/get-exercise/get-exercise.ts
var import_zod3 = require("zod");

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/default-exercises/get-exercise/get-exercise.ts
var GetExerciseUseCase = class {
  constructor(defaultExercisesRepository) {
    this.defaultExercisesRepository = defaultExercisesRepository;
  }
  defaultExercisesRepository;
  async execute({
    exerciseId
  }) {
    const exercise = await this.defaultExercisesRepository.findById(exerciseId);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    return { exercise };
  }
};

// src/use-cases/_factories/make-get-exercise-use-case.ts
function makeGetExerciseUseCase() {
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository();
  return new GetExerciseUseCase(defaultExercisesRepository);
}

// src/http/controllers/catalog-exercises/get-exercise/get-exercise.ts
async function getExercise(request, reply) {
  const getExerciseParamsSchema = import_zod3.z.object({
    id: import_zod3.z.uuid()
  });
  const { id } = getExerciseParamsSchema.parse(request.params);
  try {
    const getExerciseUseCase = makeGetExerciseUseCase();
    const { exercise } = await getExerciseUseCase.execute({ exerciseId: id });
    return reply.status(200).send({ exercise: catalogExerciseToHTTP(exercise) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/catalog-exercises/search-exercises/search-exercises.ts
var import_zod4 = require("zod");

// src/use-cases/default-exercises/search-exercises/search-exercises.ts
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

// src/use-cases/_factories/make-search-exercises-use-case.ts
function makeSearchExercisesUseCase() {
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository();
  return new SearchExercisesUseCase(defaultExercisesRepository);
}

// src/http/controllers/catalog-exercises/search-exercises/search-exercises.ts
async function searchExercises(request, reply) {
  const searchExercisesQuerySchema = import_zod4.z.object({
    q: import_zod4.z.string().optional(),
    muscleGroup: import_zod4.z.enum([
      "CHEST",
      "BACK",
      "SHOULDERS",
      "BICEPS",
      "TRICEPS",
      "FOREARMS",
      "CORE",
      "QUADS",
      "HAMSTRINGS",
      "GLUTES",
      "CALVES",
      "FULL_BODY"
    ]).optional(),
    page: import_zod4.z.coerce.number().min(1).default(1)
  });
  const { q, muscleGroup, page } = searchExercisesQuerySchema.parse(
    request.query
  );
  const searchExercisesUseCase = makeSearchExercisesUseCase();
  const { exercises, total } = await searchExercisesUseCase.execute({
    page,
    ...q ? { query: q } : {},
    ...muscleGroup ? { muscleGroup } : {}
  });
  return reply.status(200).send({
    exercises: exercises.map(catalogExerciseToHTTP),
    page,
    total
  });
}

// src/http/controllers/catalog-exercises/routes.ts
async function catalogExerciseRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/catalog/exercises", searchExercises);
  app2.get("/catalog/exercises/:id", getExercise);
  app2.post(
    "/catalog/exercises",
    { onRequest: [verifyUserRole("ADMIN")] },
    createExercise
  );
}

// src/http/controllers/exercise-templates/add-exercise-to-template/add-exercise-to-template.ts
var import_zod5 = require("zod");

// src/repositories/prisma/prisma-exercise-templates-repository.ts
var PrismaExerciseTemplatesRepository = class {
  async create(data) {
    return prisma.exerciseTemplate.create({ data });
  }
  async findById(id) {
    return prisma.exerciseTemplate.findFirst({
      where: { id, deleted_at: null }
    });
  }
  async findManyByTemplateId(templateId) {
    return prisma.exerciseTemplate.findMany({
      where: { trainment_template_id: templateId, deleted_at: null },
      orderBy: { created_at: "asc" }
    });
  }
  async save(exerciseTemplate) {
    return prisma.exerciseTemplate.update({
      where: { id: exerciseTemplate.id },
      data: exerciseTemplate
    });
  }
};

// src/repositories/prisma/prisma-trainment-templates-repository.ts
var PrismaTrainmentTemplatesRepository = class {
  async create(data) {
    return prisma.trainmentTemplate.create({ data });
  }
  async findById(id) {
    return prisma.trainmentTemplate.findFirst({
      where: { id, deleted_at: null }
    });
  }
  async findManyByUserId(userId) {
    return prisma.trainmentTemplate.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { created_at: "desc" }
    });
  }
  async save(template) {
    return prisma.trainmentTemplate.update({
      where: { id: template.id },
      data: template
    });
  }
};

// src/use-cases/errors/not-allowed-error.ts
var NotAllowedError = class extends Error {
  constructor() {
    super("Not allowed");
  }
};

// src/use-cases/exercise-templates/add-exercise-to-template/add-exercise-to-template.ts
var AddExerciseToTemplateUseCase = class {
  constructor(exerciseTemplatesRepository, trainmentTemplatesRepository, defaultExercisesRepository) {
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
    this.defaultExercisesRepository = defaultExercisesRepository;
  }
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  defaultExercisesRepository;
  async execute({
    userId,
    trainmentTemplateId,
    exerciseCatalogId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const catalogExercise = await this.defaultExercisesRepository.findById(exerciseCatalogId);
    if (!catalogExercise) {
      throw new ResourceNotFoundError();
    }
    const exerciseTemplate = await this.exerciseTemplatesRepository.create({
      trainment_template_id: trainmentTemplateId,
      exercise_catalog_id: exerciseCatalogId,
      // title is snapshotted from the catalog at add-time (no later drift).
      title: catalogExercise.title
    });
    trainmentTemplate.updated_at = /* @__PURE__ */ new Date();
    await this.trainmentTemplatesRepository.save(trainmentTemplate);
    return { exerciseTemplate };
  }
};

// src/use-cases/_factories/make-add-exercise-to-template-use-case.ts
function makeAddExerciseToTemplateUseCase() {
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository();
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  const defaultExercisesRepository = new PrismaDefaultExercisesRepository();
  return new AddExerciseToTemplateUseCase(
    exerciseTemplatesRepository,
    trainmentTemplatesRepository,
    defaultExercisesRepository
  );
}

// src/http/controllers/exercise-templates/exercise-template-presenter.ts
function exerciseTemplateToHTTP(exerciseTemplate) {
  return {
    id: exerciseTemplate.id,
    trainmentTemplateId: exerciseTemplate.trainment_template_id,
    exerciseCatalogId: exerciseTemplate.exercise_catalog_id,
    title: exerciseTemplate.title,
    createdAt: exerciseTemplate.created_at
  };
}

// src/http/controllers/exercise-templates/add-exercise-to-template/add-exercise-to-template.ts
async function addExerciseToTemplate(request, reply) {
  const paramsSchema = import_zod5.z.object({ id: import_zod5.z.uuid() });
  const bodySchema = import_zod5.z.object({ exerciseCatalogId: import_zod5.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  const { exerciseCatalogId } = bodySchema.parse(request.body);
  try {
    const useCase = makeAddExerciseToTemplateUseCase();
    const { exerciseTemplate } = await useCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
      exerciseCatalogId
    });
    return reply.status(201).send({ exerciseTemplate: exerciseTemplateToHTTP(exerciseTemplate) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/exercise-templates/fetch-template-exercises/fetch-template-exercises.ts
var import_zod6 = require("zod");

// src/use-cases/exercise-templates/fetch-template-exercises/fetch-template-exercises.ts
var FetchTemplateExercisesUseCase = class {
  constructor(exerciseTemplatesRepository, trainmentTemplatesRepository) {
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  async execute({
    userId,
    trainmentTemplateId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exerciseTemplates = await this.exerciseTemplatesRepository.findManyByTemplateId(
      trainmentTemplateId
    );
    return { exerciseTemplates };
  }
};

// src/use-cases/_factories/make-fetch-template-exercises-use-case.ts
function makeFetchTemplateExercisesUseCase() {
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository();
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new FetchTemplateExercisesUseCase(
    exerciseTemplatesRepository,
    trainmentTemplatesRepository
  );
}

// src/http/controllers/exercise-templates/fetch-template-exercises/fetch-template-exercises.ts
async function fetchTemplateExercises(request, reply) {
  const paramsSchema = import_zod6.z.object({ id: import_zod6.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeFetchTemplateExercisesUseCase();
    const { exerciseTemplates } = await useCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id
    });
    return reply.status(200).send({ exercises: exerciseTemplates.map(exerciseTemplateToHTTP) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/exercise-templates/remove-exercise-template/remove-exercise-template.ts
var import_zod7 = require("zod");

// src/use-cases/exercise-templates/remove-exercise-template/remove-exercise-template.ts
var RemoveExerciseTemplateUseCase = class {
  constructor(exerciseTemplatesRepository, trainmentTemplatesRepository) {
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  async execute({
    userId,
    exerciseTemplateId
  }) {
    const exerciseTemplate = await this.exerciseTemplatesRepository.findById(exerciseTemplateId);
    if (!exerciseTemplate) {
      throw new ResourceNotFoundError();
    }
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(
      exerciseTemplate.trainment_template_id
    );
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    exerciseTemplate.deleted_at = /* @__PURE__ */ new Date();
    await this.exerciseTemplatesRepository.save(exerciseTemplate);
    trainmentTemplate.updated_at = /* @__PURE__ */ new Date();
    await this.trainmentTemplatesRepository.save(trainmentTemplate);
  }
};

// src/use-cases/_factories/make-remove-exercise-template-use-case.ts
function makeRemoveExerciseTemplateUseCase() {
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository();
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new RemoveExerciseTemplateUseCase(
    exerciseTemplatesRepository,
    trainmentTemplatesRepository
  );
}

// src/http/controllers/exercise-templates/remove-exercise-template/remove-exercise-template.ts
async function removeExerciseTemplate(request, reply) {
  const paramsSchema = import_zod7.z.object({ id: import_zod7.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeRemoveExerciseTemplateUseCase();
    await useCase.execute({
      userId: request.user.sub,
      exerciseTemplateId: id
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(204).send();
}

// src/http/controllers/exercise-templates/routes.ts
async function exerciseTemplateRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.post("/trainment-templates/:id/exercises", addExerciseToTemplate);
  app2.get("/trainment-templates/:id/exercises", fetchTemplateExercises);
  app2.delete("/exercise-templates/:id", removeExerciseTemplate);
}

// src/http/controllers/exercises/add-exercise-to-trainment/add-exercise-to-trainment.ts
var import_zod9 = require("zod");

// src/http/controllers/_schemas/planned-sets-schema.ts
var import_zod8 = require("zod");
var plannedSetsSchema = import_zod8.z.record(
  import_zod8.z.string().regex(/^\d+$/),
  import_zod8.z.object({
    weight: import_zod8.z.number().nullable(),
    min_reps: import_zod8.z.number().int().nullable(),
    max_reps: import_zod8.z.number().int().nullable()
  })
).refine(
  (plannedSets) => {
    const indices = Object.keys(plannedSets).map(Number).sort((a, b) => a - b);
    return indices.length > 0 && indices.every((value, position) => value === position + 1);
  },
  { message: "planned_sets keys must be contiguous 1..N" }
);

// src/repositories/prisma/prisma-exercises-repository.ts
var PrismaExercisesRepository = class {
  async create(data) {
    return prisma.exercise.create({ data });
  }
  async findById(id) {
    return prisma.exercise.findUnique({ where: { id } });
  }
  async findManyByTrainmentId(trainmentId) {
    return prisma.exercise.findMany({
      where: { trainment_id: trainmentId },
      orderBy: { created_at: "asc" }
    });
  }
  async save(exercise) {
    return prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        planned_sets: exercise.planned_sets
      }
    });
  }
  async delete(id) {
    await prisma.exercise.delete({ where: { id } });
  }
};

// src/repositories/prisma/prisma-trainments-repository.ts
var PAGE_SIZE2 = 20;
var PrismaTrainmentsRepository = class {
  async create(data) {
    return prisma.trainment.create({ data });
  }
  async findById(id) {
    return prisma.trainment.findUnique({ where: { id } });
  }
  async findManyByUserId(userId, params) {
    return prisma.trainment.findMany({
      where: {
        user_id: userId,
        ...params.trainmentTemplateId ? { trainment_template_id: params.trainmentTemplateId } : {}
      },
      orderBy: { started_at: "desc" },
      take: PAGE_SIZE2,
      skip: (params.page - 1) * PAGE_SIZE2
    });
  }
  async findFinishedByUserIdInPeriod(userId, start, end) {
    return prisma.trainment.findMany({
      where: {
        user_id: userId,
        finished_at: { not: null, gte: start, lte: end }
      },
      orderBy: { finished_at: "desc" }
    });
  }
  async findPreviousSameTemplate(params) {
    return prisma.trainment.findFirst({
      where: {
        user_id: params.userId,
        trainment_template_id: params.trainmentTemplateId,
        id: { not: params.excludeTrainmentId },
        finished_at: { not: null },
        started_at: { lt: params.before }
      },
      orderBy: { started_at: "desc" }
    });
  }
  async save(trainment) {
    return prisma.trainment.update({
      where: { id: trainment.id },
      data: trainment
    });
  }
};

// src/use-cases/exercises/add-exercise-to-trainment/add-exercise-to-trainment.ts
var AddExerciseToTrainmentUseCase = class {
  constructor(exercisesRepository, trainmentsRepository, exerciseTemplatesRepository, trainmentTemplatesRepository, createSetsForExerciseUseCase) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
    this.createSetsForExerciseUseCase = createSetsForExerciseUseCase;
  }
  exercisesRepository;
  trainmentsRepository;
  exerciseTemplatesRepository;
  trainmentTemplatesRepository;
  createSetsForExerciseUseCase;
  async execute({
    userId,
    trainmentId,
    exerciseTemplateId,
    plannedSets
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exerciseTemplate = await this.exerciseTemplatesRepository.findById(exerciseTemplateId);
    if (!exerciseTemplate) {
      throw new ResourceNotFoundError();
    }
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(
      exerciseTemplate.trainment_template_id
    );
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exercise = await this.exercisesRepository.create({
      trainment_id: trainmentId,
      exercise_template_id: exerciseTemplateId,
      planned_sets: plannedSets
    });
    const { sets } = await this.createSetsForExerciseUseCase.execute({
      userId,
      trainmentId,
      exerciseId: exercise.id,
      plannedSets
    });
    return { exercise, sets };
  }
};

// src/repositories/prisma/prisma-sets-repository.ts
var PrismaSetsRepository = class {
  async createMany(data) {
    return prisma.set.createManyAndReturn({ data });
  }
  async findById(id) {
    return prisma.set.findUnique({ where: { id } });
  }
  async findManyByExerciseId(exerciseId) {
    return prisma.set.findMany({
      where: { exercise_id: exerciseId },
      orderBy: { index: "asc" }
    });
  }
  async findManyByTrainmentId(trainmentId) {
    return prisma.set.findMany({
      where: { trainment_id: trainmentId },
      orderBy: { index: "asc" }
    });
  }
  async countByExerciseId(exerciseId) {
    return prisma.set.count({ where: { exercise_id: exerciseId } });
  }
  async save(set) {
    return prisma.set.update({ where: { id: set.id }, data: set });
  }
  async delete(id) {
    await prisma.set.delete({ where: { id } });
  }
  async deleteManyByExerciseId(exerciseId) {
    await prisma.set.deleteMany({ where: { exercise_id: exerciseId } });
  }
};

// src/use-cases/_types/planned-sets.ts
function asPlannedSets(value) {
  return value ?? {};
}
function plannedSetIndices(plannedSets) {
  return Object.keys(plannedSets).map(Number).sort((a, b) => a - b);
}
function plannedSetCount(plannedSets) {
  return Object.keys(plannedSets).length;
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

// src/use-cases/_factories/make-create-sets-for-exercise-use-case.ts
function makeCreateSetsForExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository();
  return new CreateSetsForExerciseUseCase(setsRepository);
}

// src/use-cases/_factories/make-add-exercise-to-trainment-use-case.ts
function makeAddExerciseToTrainmentUseCase() {
  const exercisesRepository = new PrismaExercisesRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository();
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new AddExerciseToTrainmentUseCase(
    exercisesRepository,
    trainmentsRepository,
    exerciseTemplatesRepository,
    trainmentTemplatesRepository,
    makeCreateSetsForExerciseUseCase()
  );
}

// src/http/controllers/exercises/exercise-presenter.ts
function exerciseToHTTP(exercise) {
  return {
    id: exercise.id,
    trainmentId: exercise.trainment_id,
    exerciseTemplateId: exercise.exercise_template_id,
    plannedSets: exercise.planned_sets,
    createdAt: exercise.created_at
  };
}

// src/http/controllers/sets/set-presenter.ts
function setToHTTP(set) {
  return {
    id: set.id,
    trainmentId: set.trainment_id,
    exerciseId: set.exercise_id,
    index: set.index,
    weight: set.weight,
    repetitions: set.repetitions,
    performedAt: set.performed_at
  };
}

// src/http/controllers/exercises/add-exercise-to-trainment/add-exercise-to-trainment.ts
async function addExerciseToTrainment(request, reply) {
  const paramsSchema = import_zod9.z.object({ id: import_zod9.z.uuid() });
  const bodySchema = import_zod9.z.object({
    exerciseTemplateId: import_zod9.z.uuid(),
    plannedSets: plannedSetsSchema
  });
  const { id } = paramsSchema.parse(request.params);
  const { exerciseTemplateId, plannedSets } = bodySchema.parse(request.body);
  try {
    const useCase = makeAddExerciseToTrainmentUseCase();
    const { exercise, sets } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id,
      exerciseTemplateId,
      plannedSets
    });
    return reply.status(201).send({
      exercise: exerciseToHTTP(exercise),
      sets: sets.map(setToHTTP)
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/exercises/fetch-trainment-exercises/fetch-trainment-exercises.ts
var import_zod10 = require("zod");

// src/use-cases/exercises/fetch-trainment-exercises/fetch-trainment-exercises.ts
var FetchTrainmentExercisesUseCase = class {
  constructor(exercisesRepository, trainmentsRepository) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  exercisesRepository;
  trainmentsRepository;
  async execute({
    userId,
    trainmentId
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exercises = await this.exercisesRepository.findManyByTrainmentId(trainmentId);
    return { exercises };
  }
};

// src/use-cases/_factories/make-fetch-trainment-exercises-use-case.ts
function makeFetchTrainmentExercisesUseCase() {
  const exercisesRepository = new PrismaExercisesRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new FetchTrainmentExercisesUseCase(
    exercisesRepository,
    trainmentsRepository
  );
}

// src/http/controllers/exercises/fetch-trainment-exercises/fetch-trainment-exercises.ts
async function fetchTrainmentExercises(request, reply) {
  const paramsSchema = import_zod10.z.object({ id: import_zod10.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeFetchTrainmentExercisesUseCase();
    const { exercises } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id
    });
    return reply.status(200).send({ exercises: exercises.map(exerciseToHTTP) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/exercises/get-exercise/get-exercise.ts
var import_zod11 = require("zod");

// src/use-cases/exercises/get-exercise/get-exercise.ts
var GetExerciseUseCase2 = class {
  constructor(exercisesRepository, trainmentsRepository) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  exercisesRepository;
  trainmentsRepository;
  async execute({
    userId,
    exerciseId
  }) {
    const exercise = await this.exercisesRepository.findById(exerciseId);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const trainment = await this.trainmentsRepository.findById(
      exercise.trainment_id
    );
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    return { exercise };
  }
};

// src/use-cases/_factories/make-get-performed-exercise-use-case.ts
function makeGetPerformedExerciseUseCase() {
  const exercisesRepository = new PrismaExercisesRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new GetExerciseUseCase2(exercisesRepository, trainmentsRepository);
}

// src/http/controllers/exercises/get-exercise/get-exercise.ts
async function getExercise2(request, reply) {
  const paramsSchema = import_zod11.z.object({ id: import_zod11.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeGetPerformedExerciseUseCase();
    const { exercise } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id
    });
    return reply.status(200).send({ exercise: exerciseToHTTP(exercise) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/exercises/remove-exercise-from-trainment/remove-exercise-from-trainment.ts
var import_zod12 = require("zod");

// src/use-cases/exercises/remove-exercise-from-trainment/remove-exercise-from-trainment.ts
var RemoveExerciseFromTrainmentUseCase = class {
  constructor(exercisesRepository, trainmentsRepository, setsRepository) {
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
    this.setsRepository = setsRepository;
  }
  exercisesRepository;
  trainmentsRepository;
  setsRepository;
  async execute({
    userId,
    exerciseId
  }) {
    const exercise = await this.exercisesRepository.findById(exerciseId);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const trainment = await this.trainmentsRepository.findById(
      exercise.trainment_id
    );
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    await this.setsRepository.deleteManyByExerciseId(exerciseId);
    await this.exercisesRepository.delete(exerciseId);
  }
};

// src/use-cases/_factories/make-remove-exercise-from-trainment-use-case.ts
function makeRemoveExerciseFromTrainmentUseCase() {
  const exercisesRepository = new PrismaExercisesRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  const setsRepository = new PrismaSetsRepository();
  return new RemoveExerciseFromTrainmentUseCase(
    exercisesRepository,
    trainmentsRepository,
    setsRepository
  );
}

// src/http/controllers/exercises/remove-exercise-from-trainment/remove-exercise-from-trainment.ts
async function removeExerciseFromTrainment(request, reply) {
  const paramsSchema = import_zod12.z.object({ id: import_zod12.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeRemoveExerciseFromTrainmentUseCase();
    await useCase.execute({
      userId: request.user.sub,
      exerciseId: id
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(204).send();
}

// src/http/controllers/exercises/routes.ts
async function exerciseRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/trainments/:id/exercises", fetchTrainmentExercises);
  app2.post("/trainments/:id/exercises", addExerciseToTrainment);
  app2.get("/exercises/:id", getExercise2);
  app2.delete("/exercises/:id", removeExerciseFromTrainment);
}

// src/http/controllers/healthcheck/healthcheck.ts
async function getHealthCheck(request, reply) {
  return reply.status(200).send({
    message: "Server is healthy"
  });
}

// src/http/controllers/healthcheck/routes.ts
async function healthCheckRoutes(app2) {
  app2.get("/healthcheck", getHealthCheck);
}

// src/http/controllers/metrics/fetch-exercise-metrics/fetch-exercise-metrics.ts
var import_zod13 = require("zod");

// src/repositories/prisma/prisma-metrics-repository.ts
var PrismaMetricsRepository = class {
  async upsertByCurrentSetId(data) {
    return prisma.metric.upsert({
      where: { current_set_id: data.current_set_id },
      create: data,
      update: {
        user_id: data.user_id,
        trainment_id: data.trainment_id,
        exercise_id: data.exercise_id,
        previous_set_id: data.previous_set_id,
        weight_diff: data.weight_diff,
        repetitions_diff: data.repetitions_diff
      }
    });
  }
  async findManyByTrainmentId(trainmentId) {
    return prisma.metric.findMany({ where: { trainment_id: trainmentId } });
  }
  async findManyByExerciseId(exerciseId) {
    return prisma.metric.findMany({ where: { exercise_id: exerciseId } });
  }
};

// src/use-cases/metrics/fetch-exercise-metrics/fetch-exercise-metrics.ts
var FetchExerciseMetricsUseCase = class {
  constructor(metricsRepository, exercisesRepository, trainmentsRepository) {
    this.metricsRepository = metricsRepository;
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  metricsRepository;
  exercisesRepository;
  trainmentsRepository;
  async execute({
    userId,
    exerciseId
  }) {
    const exercise = await this.exercisesRepository.findById(exerciseId);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const trainment = await this.trainmentsRepository.findById(
      exercise.trainment_id
    );
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const metrics = await this.metricsRepository.findManyByExerciseId(exerciseId);
    return { metrics };
  }
};

// src/use-cases/_factories/make-fetch-exercise-metrics-use-case.ts
function makeFetchExerciseMetricsUseCase() {
  const metricsRepository = new PrismaMetricsRepository();
  const exercisesRepository = new PrismaExercisesRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new FetchExerciseMetricsUseCase(
    metricsRepository,
    exercisesRepository,
    trainmentsRepository
  );
}

// src/http/controllers/metrics/metric-presenter.ts
function metricToHTTP(metric) {
  return {
    id: metric.id,
    trainmentId: metric.trainment_id,
    exerciseId: metric.exercise_id,
    previousSetId: metric.previous_set_id,
    currentSetId: metric.current_set_id,
    weightDiff: metric.weight_diff,
    repetitionsDiff: metric.repetitions_diff
  };
}

// src/http/controllers/metrics/fetch-exercise-metrics/fetch-exercise-metrics.ts
async function fetchExerciseMetrics(request, reply) {
  const paramsSchema = import_zod13.z.object({ id: import_zod13.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeFetchExerciseMetricsUseCase();
    const { metrics } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id
    });
    return reply.status(200).send({ metrics: metrics.map(metricToHTTP) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/metrics/fetch-trainment-metrics/fetch-trainment-metrics.ts
var import_zod14 = require("zod");

// src/use-cases/metrics/fetch-trainment-metrics/fetch-trainment-metrics.ts
var FetchTrainmentMetricsUseCase = class {
  constructor(metricsRepository, trainmentsRepository) {
    this.metricsRepository = metricsRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  metricsRepository;
  trainmentsRepository;
  async execute({
    userId,
    trainmentId
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const metrics = await this.metricsRepository.findManyByTrainmentId(trainmentId);
    return { metrics };
  }
};

// src/use-cases/_factories/make-fetch-trainment-metrics-use-case.ts
function makeFetchTrainmentMetricsUseCase() {
  const metricsRepository = new PrismaMetricsRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new FetchTrainmentMetricsUseCase(
    metricsRepository,
    trainmentsRepository
  );
}

// src/http/controllers/metrics/fetch-trainment-metrics/fetch-trainment-metrics.ts
async function fetchTrainmentMetrics(request, reply) {
  const paramsSchema = import_zod14.z.object({ id: import_zod14.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeFetchTrainmentMetricsUseCase();
    const { metrics } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id
    });
    return reply.status(200).send({ metrics: metrics.map(metricToHTTP) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/metrics/routes.ts
async function metricRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/trainments/:id/metrics", fetchTrainmentMetrics);
  app2.get("/exercises/:id/metrics", fetchExerciseMetrics);
}

// src/repositories/prisma/prisma-user-preferences-repository.ts
var PrismaUserPreferencesRepository = class {
  async create(data) {
    return prisma.userPreferences.create({ data });
  }
  async findByUserId(userId) {
    return prisma.userPreferences.findUnique({ where: { user_id: userId } });
  }
  async save(preferences) {
    return prisma.userPreferences.update({
      where: { id: preferences.id },
      data: { preferences: preferences.preferences ?? {} }
    });
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

// src/use-cases/_factories/make-get-user-preferences-use-case.ts
function makeGetUserPreferencesUseCase() {
  const userPreferencesRepository = new PrismaUserPreferencesRepository();
  return new GetUserPreferencesUseCase(userPreferencesRepository);
}

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

// src/http/controllers/preferences/preferences-presenter.ts
function preferencesToHTTP(userPreferences) {
  return resolvePreferences(userPreferences.preferences);
}

// src/http/controllers/preferences/get-preferences/get-preferences.ts
async function getPreferences(request, reply) {
  try {
    const useCase = makeGetUserPreferencesUseCase();
    const { userPreferences } = await useCase.execute({
      userId: request.user.sub
    });
    return reply.status(200).send({ preferences: preferencesToHTTP(userPreferences) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/preferences/update-preferences/update-preferences.ts
var import_zod15 = require("zod");

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

// src/use-cases/_factories/make-update-user-preferences-use-case.ts
function makeUpdateUserPreferencesUseCase() {
  const userPreferencesRepository = new PrismaUserPreferencesRepository();
  return new UpdateUserPreferencesUseCase(userPreferencesRepository);
}

// src/http/controllers/preferences/update-preferences/update-preferences.ts
async function updatePreferences(request, reply) {
  const updatePreferencesBodySchema = import_zod15.z.object({
    weightUnit: import_zod15.z.enum(WEIGHT_UNITS).optional(),
    theme: import_zod15.z.enum(THEMES).optional(),
    // MVP renders light only
    lengthUnit: import_zod15.z.enum(LENGTH_UNITS).optional(),
    weeklyTrainingCount: import_zod15.z.coerce.number().int().min(1).max(14).nullable().optional()
    // null clears the goal
  }).refine((v) => Object.keys(v).length > 0, {
    message: "Provide at least one preference"
  });
  const data = updatePreferencesBodySchema.parse(request.body);
  try {
    const useCase = makeUpdateUserPreferencesUseCase();
    const { userPreferences } = await useCase.execute({
      userId: request.user.sub,
      data
    });
    return reply.status(200).send({ preferences: preferencesToHTTP(userPreferences) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/preferences/routes.ts
async function preferenceRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/preferences", getPreferences);
  app2.patch("/preferences", updatePreferences);
}

// src/http/controllers/sets/add-set-to-exercise/add-set-to-exercise.ts
var import_zod16 = require("zod");

// src/use-cases/sets/add-set-to-exercise/add-set-to-exercise.ts
var AddSetToExerciseUseCase = class {
  constructor(setsRepository, exercisesRepository, trainmentsRepository) {
    this.setsRepository = setsRepository;
    this.exercisesRepository = exercisesRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  setsRepository;
  exercisesRepository;
  trainmentsRepository;
  async execute({
    userId,
    exerciseId,
    weight,
    minReps,
    maxReps
  }) {
    const exercise = await this.exercisesRepository.findById(exerciseId);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const trainment = await this.trainmentsRepository.findById(
      exercise.trainment_id
    );
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const plannedSets = { ...asPlannedSets(exercise.planned_sets) };
    const previousIndex = plannedSetCount(plannedSets);
    const newIndex = previousIndex + 1;
    const previous = plannedSets[String(previousIndex)];
    plannedSets[String(newIndex)] = {
      weight: weight ?? previous?.weight ?? null,
      min_reps: minReps ?? previous?.min_reps ?? null,
      max_reps: maxReps ?? previous?.max_reps ?? null
    };
    exercise.planned_sets = plannedSets;
    await this.exercisesRepository.save(exercise);
    const [set] = await this.setsRepository.createMany([
      {
        trainment_id: exercise.trainment_id,
        exercise_id: exerciseId,
        user_id: userId,
        index: newIndex,
        weight: null,
        repetitions: null
      }
    ]);
    return { set };
  }
};

// src/use-cases/_factories/make-add-set-to-exercise-use-case.ts
function makeAddSetToExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository();
  const exercisesRepository = new PrismaExercisesRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new AddSetToExerciseUseCase(
    setsRepository,
    exercisesRepository,
    trainmentsRepository
  );
}

// src/http/controllers/sets/add-set-to-exercise/add-set-to-exercise.ts
async function addSetToExercise(request, reply) {
  const paramsSchema = import_zod16.z.object({ id: import_zod16.z.uuid() });
  const bodySchema = import_zod16.z.object({
    weight: import_zod16.z.number().optional(),
    minReps: import_zod16.z.number().int().optional(),
    maxReps: import_zod16.z.number().int().optional()
  });
  const { id } = paramsSchema.parse(request.params);
  const { weight, minReps, maxReps } = bodySchema.parse(request.body ?? {});
  try {
    const useCase = makeAddSetToExerciseUseCase();
    const { set } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id,
      ...weight !== void 0 ? { weight } : {},
      ...minReps !== void 0 ? { minReps } : {},
      ...maxReps !== void 0 ? { maxReps } : {}
    });
    return reply.status(201).send({ set: setToHTTP(set) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/sets/fetch-sets-by-exercise/fetch-sets-by-exercise.ts
var import_zod17 = require("zod");

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

// src/use-cases/_factories/make-fetch-sets-by-exercise-use-case.ts
function makeFetchSetsByExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository();
  return new FetchSetsByExerciseUseCase(setsRepository);
}

// src/http/controllers/sets/fetch-sets-by-exercise/fetch-sets-by-exercise.ts
async function fetchSetsByExercise(request, reply) {
  const paramsSchema = import_zod17.z.object({ id: import_zod17.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeFetchSetsByExerciseUseCase();
    const { sets } = await useCase.execute({
      userId: request.user.sub,
      exerciseId: id
    });
    return reply.status(200).send({ sets: sets.map(setToHTTP) });
  } catch (err) {
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/sets/fetch-sets-by-trainment/fetch-sets-by-trainment.ts
var import_zod18 = require("zod");

// src/use-cases/sets/fetch-sets-by-trainment/fetch-sets-by-trainment.ts
var FetchSetsByTrainmentUseCase = class {
  constructor(setsRepository, trainmentsRepository) {
    this.setsRepository = setsRepository;
    this.trainmentsRepository = trainmentsRepository;
  }
  setsRepository;
  trainmentsRepository;
  async execute({
    userId,
    trainmentId
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    const sets = await this.setsRepository.findManyByTrainmentId(trainmentId);
    return { sets };
  }
};

// src/use-cases/_factories/make-fetch-sets-by-trainment-use-case.ts
function makeFetchSetsByTrainmentUseCase() {
  const setsRepository = new PrismaSetsRepository();
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new FetchSetsByTrainmentUseCase(setsRepository, trainmentsRepository);
}

// src/http/controllers/sets/fetch-sets-by-trainment/fetch-sets-by-trainment.ts
async function fetchSetsByTrainment(request, reply) {
  const paramsSchema = import_zod18.z.object({ id: import_zod18.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeFetchSetsByTrainmentUseCase();
    const { sets } = await useCase.execute({
      userId: request.user.sub,
      trainmentId: id
    });
    return reply.status(200).send({ sets: sets.map(setToHTTP) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/sets/remove-set-from-exercise/remove-set-from-exercise.ts
var import_zod19 = require("zod");

// src/use-cases/errors/invalid-set-index-error.ts
var InvalidSetIndexError = class extends Error {
  constructor() {
    super("Invalid set index");
  }
};

// src/use-cases/sets/remove-set-from-exercise/remove-set-from-exercise.ts
var RemoveSetFromExerciseUseCase = class {
  constructor(setsRepository, exercisesRepository) {
    this.setsRepository = setsRepository;
    this.exercisesRepository = exercisesRepository;
  }
  setsRepository;
  exercisesRepository;
  async execute({
    userId,
    setId
  }) {
    const set = await this.setsRepository.findById(setId);
    if (!set) {
      throw new ResourceNotFoundError();
    }
    if (set.user_id !== userId) {
      throw new NotAllowedError();
    }
    const exercise = await this.exercisesRepository.findById(set.exercise_id);
    if (!exercise) {
      throw new ResourceNotFoundError();
    }
    const plannedSets = { ...asPlannedSets(exercise.planned_sets) };
    const lastIndex = plannedSetCount(plannedSets);
    if (set.index !== lastIndex) {
      throw new InvalidSetIndexError();
    }
    delete plannedSets[String(lastIndex)];
    exercise.planned_sets = plannedSets;
    await this.setsRepository.delete(set.id);
    await this.exercisesRepository.save(exercise);
  }
};

// src/use-cases/_factories/make-remove-set-from-exercise-use-case.ts
function makeRemoveSetFromExerciseUseCase() {
  const setsRepository = new PrismaSetsRepository();
  const exercisesRepository = new PrismaExercisesRepository();
  return new RemoveSetFromExerciseUseCase(setsRepository, exercisesRepository);
}

// src/http/controllers/sets/remove-set-from-exercise/remove-set-from-exercise.ts
async function removeSetFromExercise(request, reply) {
  const paramsSchema = import_zod19.z.object({ id: import_zod19.z.uuid() });
  const { id } = paramsSchema.parse(request.params);
  try {
    const useCase = makeRemoveSetFromExerciseUseCase();
    await useCase.execute({
      userId: request.user.sub,
      setId: id
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    if (err instanceof InvalidSetIndexError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(204).send();
}

// src/http/controllers/sets/update-set/update-set.ts
var import_zod20 = require("zod");

// src/use-cases/sets/update-set/update-set.ts
var UpdateSetUseCase = class {
  constructor(setsRepository) {
    this.setsRepository = setsRepository;
  }
  setsRepository;
  async execute({
    userId,
    setId,
    weight,
    repetitions,
    performedAt
  }) {
    const set = await this.setsRepository.findById(setId);
    if (!set) {
      throw new ResourceNotFoundError();
    }
    if (set.user_id !== userId) {
      throw new NotAllowedError();
    }
    if (weight !== void 0) {
      set.weight = weight;
    }
    if (repetitions !== void 0) {
      set.repetitions = repetitions;
    }
    set.performed_at = performedAt ?? /* @__PURE__ */ new Date();
    const updated = await this.setsRepository.save(set);
    return { set: updated };
  }
};

// src/use-cases/_factories/make-update-set-use-case.ts
function makeUpdateSetUseCase() {
  const setsRepository = new PrismaSetsRepository();
  return new UpdateSetUseCase(setsRepository);
}

// src/http/controllers/sets/update-set/update-set.ts
async function updateSet(request, reply) {
  const paramsSchema = import_zod20.z.object({ id: import_zod20.z.uuid() });
  const bodySchema = import_zod20.z.object({
    weight: import_zod20.z.number().min(0).optional(),
    repetitions: import_zod20.z.number().int().min(0).optional(),
    performedAt: import_zod20.z.coerce.date().optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field"
  });
  const { id } = paramsSchema.parse(request.params);
  const { weight, repetitions, performedAt } = bodySchema.parse(request.body);
  try {
    const useCase = makeUpdateSetUseCase();
    const { set } = await useCase.execute({
      userId: request.user.sub,
      setId: id,
      ...weight !== void 0 ? { weight } : {},
      ...repetitions !== void 0 ? { repetitions } : {},
      ...performedAt !== void 0 ? { performedAt } : {}
    });
    return reply.status(200).send({ set: setToHTTP(set) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/sets/routes.ts
async function setRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/exercises/:id/sets", fetchSetsByExercise);
  app2.post("/exercises/:id/sets", addSetToExercise);
  app2.patch("/sets/:id", updateSet);
  app2.delete("/sets/:id", removeSetFromExercise);
  app2.get("/trainments/:id/sets", fetchSetsByTrainment);
}

// src/http/controllers/trainment-templates/create-trainment-template/create-trainment-template.ts
var import_zod21 = require("zod");

// src/use-cases/trainment-templates/create-trainment-template/create-trainment-template.ts
var CreateTrainmentTemplateUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentTemplatesRepository;
  async execute({
    userId,
    title
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.create({
      user_id: userId,
      title
    });
    return { trainmentTemplate };
  }
};

// src/use-cases/_factories/make-create-trainment-template-use-case.ts
function makeCreateTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new CreateTrainmentTemplateUseCase(trainmentTemplatesRepository);
}

// src/http/controllers/trainment-templates/trainment-template-presenter.ts
function trainmentTemplateToHTTP(template) {
  return {
    id: template.id,
    title: template.title,
    createdAt: template.created_at,
    updatedAt: template.updated_at
  };
}

// src/http/controllers/trainment-templates/create-trainment-template/create-trainment-template.ts
async function createTrainmentTemplate(request, reply) {
  const createTrainmentTemplateBodySchema = import_zod21.z.object({
    title: import_zod21.z.string().min(1)
  });
  const { title } = createTrainmentTemplateBodySchema.parse(request.body);
  const createTrainmentTemplateUseCase = makeCreateTrainmentTemplateUseCase();
  const { trainmentTemplate } = await createTrainmentTemplateUseCase.execute({
    userId: request.user.sub,
    title
  });
  return reply.status(201).send({ trainmentTemplate: trainmentTemplateToHTTP(trainmentTemplate) });
}

// src/http/controllers/trainment-templates/delete-trainment-template/delete-trainment-template.ts
var import_zod22 = require("zod");

// src/use-cases/trainment-templates/delete-trainment-template/delete-trainment-template.ts
var DeleteTrainmentTemplateUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentTemplatesRepository;
  async execute({
    userId,
    trainmentTemplateId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    trainmentTemplate.deleted_at = /* @__PURE__ */ new Date();
    await this.trainmentTemplatesRepository.save(trainmentTemplate);
  }
};

// src/use-cases/_factories/make-delete-trainment-template-use-case.ts
function makeDeleteTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new DeleteTrainmentTemplateUseCase(trainmentTemplatesRepository);
}

// src/http/controllers/trainment-templates/delete-trainment-template/delete-trainment-template.ts
async function deleteTrainmentTemplate(request, reply) {
  const deleteTrainmentTemplateParamsSchema = import_zod22.z.object({
    id: import_zod22.z.uuid()
  });
  const { id } = deleteTrainmentTemplateParamsSchema.parse(request.params);
  try {
    const deleteTrainmentTemplateUseCase = makeDeleteTrainmentTemplateUseCase();
    await deleteTrainmentTemplateUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(204).send();
}

// src/use-cases/trainment-templates/fetch-user-trainment-templates/fetch-user-trainment-templates.ts
var FetchUserTrainmentTemplatesUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentTemplatesRepository;
  async execute({
    userId
  }) {
    const trainmentTemplates = await this.trainmentTemplatesRepository.findManyByUserId(userId);
    return { trainmentTemplates };
  }
};

// src/use-cases/_factories/make-fetch-user-trainment-templates-use-case.ts
function makeFetchUserTrainmentTemplatesUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new FetchUserTrainmentTemplatesUseCase(trainmentTemplatesRepository);
}

// src/http/controllers/trainment-templates/fetch-user-trainment-templates/fetch-user-trainment-templates.ts
async function fetchUserTrainmentTemplates(request, reply) {
  const fetchUserTrainmentTemplatesUseCase = makeFetchUserTrainmentTemplatesUseCase();
  const { trainmentTemplates } = await fetchUserTrainmentTemplatesUseCase.execute({
    userId: request.user.sub
  });
  return reply.status(200).send({
    trainmentTemplates: trainmentTemplates.map(trainmentTemplateToHTTP)
  });
}

// src/http/controllers/trainment-templates/get-trainment-template/get-trainment-template.ts
var import_zod23 = require("zod");

// src/use-cases/trainment-templates/get-trainment-template/get-trainment-template.ts
var GetTrainmentTemplateUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentTemplatesRepository;
  async execute({
    userId,
    trainmentTemplateId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    return { trainmentTemplate };
  }
};

// src/use-cases/_factories/make-get-trainment-template-use-case.ts
function makeGetTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new GetTrainmentTemplateUseCase(trainmentTemplatesRepository);
}

// src/http/controllers/trainment-templates/get-trainment-template/get-trainment-template.ts
async function getTrainmentTemplate(request, reply) {
  const getTrainmentTemplateParamsSchema = import_zod23.z.object({
    id: import_zod23.z.uuid()
  });
  const { id } = getTrainmentTemplateParamsSchema.parse(request.params);
  try {
    const getTrainmentTemplateUseCase = makeGetTrainmentTemplateUseCase();
    const { trainmentTemplate } = await getTrainmentTemplateUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id
    });
    return reply.status(200).send({ trainmentTemplate: trainmentTemplateToHTTP(trainmentTemplate) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/trainment-templates/update-trainment-template/update-trainment-template.ts
var import_zod24 = require("zod");

// src/use-cases/trainment-templates/update-trainment-template/update-trainment-template.ts
var UpdateTrainmentTemplateUseCase = class {
  constructor(trainmentTemplatesRepository) {
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentTemplatesRepository;
  async execute({
    userId,
    trainmentTemplateId,
    title
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    trainmentTemplate.title = title;
    const updated = await this.trainmentTemplatesRepository.save(trainmentTemplate);
    return { trainmentTemplate: updated };
  }
};

// src/use-cases/_factories/make-update-trainment-template-use-case.ts
function makeUpdateTrainmentTemplateUseCase() {
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new UpdateTrainmentTemplateUseCase(trainmentTemplatesRepository);
}

// src/http/controllers/trainment-templates/update-trainment-template/update-trainment-template.ts
async function updateTrainmentTemplate(request, reply) {
  const updateTrainmentTemplateParamsSchema = import_zod24.z.object({
    id: import_zod24.z.uuid()
  });
  const updateTrainmentTemplateBodySchema = import_zod24.z.object({
    title: import_zod24.z.string().min(1)
  });
  const { id } = updateTrainmentTemplateParamsSchema.parse(request.params);
  const { title } = updateTrainmentTemplateBodySchema.parse(request.body);
  try {
    const updateTrainmentTemplateUseCase = makeUpdateTrainmentTemplateUseCase();
    const { trainmentTemplate } = await updateTrainmentTemplateUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId: id,
      title
    });
    return reply.status(200).send({ trainmentTemplate: trainmentTemplateToHTTP(trainmentTemplate) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/trainment-templates/routes.ts
async function trainmentTemplateRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.post("/trainment-templates", createTrainmentTemplate);
  app2.get("/trainment-templates", fetchUserTrainmentTemplates);
  app2.get("/trainment-templates/:id", getTrainmentTemplate);
  app2.patch("/trainment-templates/:id", updateTrainmentTemplate);
  app2.delete("/trainment-templates/:id", deleteTrainmentTemplate);
}

// src/http/controllers/trainments/fetch-user-trainments/fetch-user-trainments.ts
var import_zod25 = require("zod");

// src/use-cases/trainments/fetch-user-trainments/fetch-user-trainments.ts
var FetchUserTrainmentsUseCase = class {
  constructor(trainmentsRepository) {
    this.trainmentsRepository = trainmentsRepository;
  }
  trainmentsRepository;
  async execute({
    userId,
    trainmentTemplateId,
    page
  }) {
    const trainments = await this.trainmentsRepository.findManyByUserId(userId, {
      page,
      ...trainmentTemplateId ? { trainmentTemplateId } : {}
    });
    return { trainments };
  }
};

// src/use-cases/_factories/make-fetch-user-trainments-use-case.ts
function makeFetchUserTrainmentsUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new FetchUserTrainmentsUseCase(trainmentsRepository);
}

// src/http/controllers/trainments/trainment-presenter.ts
function trainmentToHTTP(trainment) {
  return {
    id: trainment.id,
    trainmentTemplateId: trainment.trainment_template_id,
    userId: trainment.user_id,
    startedAt: trainment.started_at,
    finishedAt: trainment.finished_at
  };
}

// src/http/controllers/trainments/fetch-user-trainments/fetch-user-trainments.ts
async function fetchUserTrainments(request, reply) {
  const fetchUserTrainmentsQuerySchema = import_zod25.z.object({
    trainmentTemplateId: import_zod25.z.uuid().optional(),
    page: import_zod25.z.coerce.number().int().min(1).default(1)
  });
  const { trainmentTemplateId, page } = fetchUserTrainmentsQuerySchema.parse(
    request.query
  );
  const fetchUserTrainmentsUseCase = makeFetchUserTrainmentsUseCase();
  const { trainments } = await fetchUserTrainmentsUseCase.execute({
    userId: request.user.sub,
    page,
    ...trainmentTemplateId ? { trainmentTemplateId } : {}
  });
  return reply.status(200).send({ trainments: trainments.map(trainmentToHTTP), page });
}

// src/http/controllers/trainments/finish-trainment/finish-trainment.ts
var import_zod26 = require("zod");

// src/use-cases/errors/trainment-already-finished-error.ts
var TrainmentAlreadyFinishedError = class extends Error {
  constructor() {
    super("Trainment already finished");
  }
};

// src/use-cases/trainments/finish-trainment/finish-trainment.ts
var FinishTrainmentUseCase = class {
  constructor(trainmentsRepository, enqueueEventUseCase) {
    this.trainmentsRepository = trainmentsRepository;
    this.enqueueEventUseCase = enqueueEventUseCase;
  }
  trainmentsRepository;
  enqueueEventUseCase;
  async execute({
    userId,
    trainmentId
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    if (trainment.finished_at !== null) {
      throw new TrainmentAlreadyFinishedError();
    }
    trainment.finished_at = /* @__PURE__ */ new Date();
    const finished = await this.trainmentsRepository.save(trainment);
    await this.enqueueEventUseCase.execute({
      eventType: "COMPUTE_TRAINMENT_METRICS",
      userId,
      metadata: { trainmentId: finished.id }
    });
    return { trainment: finished };
  }
};

// src/repositories/prisma/prisma-events-repository.ts
var PrismaEventsRepository = class {
  async create(data) {
    return prisma.event.create({ data });
  }
  async findById(id) {
    return prisma.event.findUnique({ where: { id } });
  }
  async markProcessing(id) {
    await prisma.event.update({
      where: { id },
      data: { status: "PROCESSING" }
    });
  }
  async markCompleted(id) {
    await prisma.event.update({
      where: { id },
      data: { status: "COMPLETED", processed_at: /* @__PURE__ */ new Date() }
    });
  }
  async markFailed(id, attempts, error) {
    await prisma.event.update({
      where: { id },
      data: {
        status: "FAILED",
        attempts,
        last_error: error,
        processed_at: /* @__PURE__ */ new Date()
      }
    });
  }
  async findStalePending(olderThan) {
    return prisma.event.findMany({
      where: { status: "PENDING", created_at: { lte: olderThan } },
      orderBy: { created_at: "asc" }
    });
  }
};

// src/lib/queue.ts
var import_bullmq = require("bullmq");

// src/use-cases/events/process-event/process-event.ts
var ProcessEventUseCase = class {
  constructor(eventsRepository, handlers) {
    this.eventsRepository = eventsRepository;
    this.handlers = handlers;
  }
  eventsRepository;
  handlers;
  async execute({
    eventId,
    attemptsMade = 1,
    maxAttempts = 1
  }) {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new ResourceNotFoundError();
    }
    const handler = this.handlers[event.event_type];
    if (!handler) {
      throw new Error(
        `No handler registered for event type ${event.event_type}`
      );
    }
    await this.eventsRepository.markProcessing(event.id);
    try {
      await handler.handle(event);
      await this.eventsRepository.markCompleted(event.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isTerminal = attemptsMade >= maxAttempts;
      if (isTerminal) {
        await this.eventsRepository.markFailed(event.id, attemptsMade, message);
      }
      throw err;
    }
    return { event };
  }
};

// src/use-cases/metrics/compute-trainment-metrics/compute-trainment-metrics.ts
var ComputeTrainmentMetricsUseCase = class {
  constructor(trainmentsRepository, exercisesRepository, setsRepository, metricsRepository) {
    this.trainmentsRepository = trainmentsRepository;
    this.exercisesRepository = exercisesRepository;
    this.setsRepository = setsRepository;
    this.metricsRepository = metricsRepository;
  }
  trainmentsRepository;
  exercisesRepository;
  setsRepository;
  metricsRepository;
  /** EventHandler entrypoint: reads `trainmentId` from the event metadata. */
  async handle(event) {
    const { trainmentId } = event.metadata ?? {};
    if (!trainmentId) {
      return;
    }
    await this.execute({ trainmentId });
  }
  async execute({
    trainmentId
  }) {
    const current = await this.trainmentsRepository.findById(trainmentId);
    if (!current) {
      return { metrics: [] };
    }
    const previous = await this.trainmentsRepository.findPreviousSameTemplate({
      userId: current.user_id,
      trainmentTemplateId: current.trainment_template_id,
      before: current.started_at,
      excludeTrainmentId: current.id
    });
    if (!previous) {
      return { metrics: [] };
    }
    const currentExercises = await this.exercisesRepository.findManyByTrainmentId(current.id);
    const previousExercises = await this.exercisesRepository.findManyByTrainmentId(previous.id);
    const previousByTemplate = /* @__PURE__ */ new Map();
    for (const exercise of previousExercises) {
      if (!previousByTemplate.has(exercise.exercise_template_id)) {
        previousByTemplate.set(exercise.exercise_template_id, exercise);
      }
    }
    const metrics = [];
    for (const exercise of currentExercises) {
      const previousExercise = previousByTemplate.get(
        exercise.exercise_template_id
      );
      if (!previousExercise) {
        continue;
      }
      const currentSets = await this.setsRepository.findManyByExerciseId(
        exercise.id
      );
      const previousSets = await this.setsRepository.findManyByExerciseId(
        previousExercise.id
      );
      const previousByIndex = new Map(previousSets.map((set) => [set.index, set]));
      for (const set of currentSets) {
        const previousSet = previousByIndex.get(set.index);
        if (!previousSet) {
          continue;
        }
        if (set.weight === null || set.repetitions === null || previousSet.weight === null || previousSet.repetitions === null) {
          continue;
        }
        const metric = await this.metricsRepository.upsertByCurrentSetId({
          user_id: current.user_id,
          trainment_id: current.id,
          exercise_id: exercise.id,
          previous_set_id: previousSet.id,
          current_set_id: set.id,
          weight_diff: set.weight - previousSet.weight,
          repetitions_diff: set.repetitions - previousSet.repetitions
        });
        metrics.push(metric);
      }
    }
    return { metrics };
  }
};

// src/use-cases/_factories/make-compute-trainment-metrics-use-case.ts
function makeComputeTrainmentMetricsUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository();
  const exercisesRepository = new PrismaExercisesRepository();
  const setsRepository = new PrismaSetsRepository();
  const metricsRepository = new PrismaMetricsRepository();
  return new ComputeTrainmentMetricsUseCase(
    trainmentsRepository,
    exercisesRepository,
    setsRepository,
    metricsRepository
  );
}

// src/use-cases/_factories/make-event-handler-registry.ts
function makeEventHandlerRegistry() {
  return {
    COMPUTE_TRAINMENT_METRICS: makeComputeTrainmentMetricsUseCase()
  };
}

// src/use-cases/_factories/make-process-event-use-case.ts
function makeProcessEventUseCase() {
  const eventsRepository = new PrismaEventsRepository();
  return new ProcessEventUseCase(eventsRepository, makeEventHandlerRegistry());
}

// src/lib/queue.ts
var METRICS_QUEUE = "metrics";
function getConnection() {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    // `maxRetriesPerRequest: null` is required by BullMQ's blocking commands.
    maxRetriesPerRequest: null,
    ...url.username ? { username: url.username } : {},
    ...url.password ? { password: url.password } : {},
    ...url.protocol === "rediss:" ? { tls: {} } : {}
  };
}
var metricsQueue;
function getMetricsQueue() {
  if (!metricsQueue) {
    metricsQueue = new import_bullmq.Queue(METRICS_QUEUE, { connection: getConnection() });
  }
  return metricsQueue;
}
function startMetricsWorker() {
  const worker = new import_bullmq.Worker(
    METRICS_QUEUE,
    async (job) => {
      await makeProcessEventUseCase().execute({
        eventId: job.data.eventId,
        attemptsMade: job.attemptsMade + 1,
        maxAttempts: job.opts.attempts ?? 1
      });
    },
    { connection: getConnection(), concurrency: 5 }
  );
  return worker;
}

// src/queues/bullmq-event-queue.ts
var BullMqEventQueue = class {
  async add(job) {
    if (env.NODE_ENV === "test") return;
    await getMetricsQueue().add(
      job.eventType,
      { eventId: job.eventId },
      {
        jobId: job.eventId,
        attempts: 5,
        backoff: { type: "exponential", delay: 2e3 },
        removeOnComplete: true
      }
    );
  }
};

// src/use-cases/events/enqueue-event/enqueue-event.ts
var EnqueueEventUseCase = class {
  constructor(eventsRepository, eventQueue) {
    this.eventsRepository = eventsRepository;
    this.eventQueue = eventQueue;
  }
  eventsRepository;
  eventQueue;
  async execute({
    eventType,
    userId,
    metadata
  }) {
    const event = await this.eventsRepository.create({
      event_type: eventType,
      user_id: userId,
      metadata
    });
    try {
      await this.eventQueue.add({ eventId: event.id, eventType, metadata });
    } catch (err) {
      console.error("[events] failed to enqueue job, sweeper will retry", err);
    }
    return { event };
  }
};

// src/use-cases/_factories/make-enqueue-event-use-case.ts
function makeEnqueueEventUseCase() {
  const eventsRepository = new PrismaEventsRepository();
  const eventQueue = new BullMqEventQueue();
  return new EnqueueEventUseCase(eventsRepository, eventQueue);
}

// src/use-cases/_factories/make-finish-trainment-use-case.ts
function makeFinishTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new FinishTrainmentUseCase(
    trainmentsRepository,
    makeEnqueueEventUseCase()
  );
}

// src/http/controllers/trainments/finish-trainment/finish-trainment.ts
async function finishTrainment(request, reply) {
  const finishTrainmentParamsSchema = import_zod26.z.object({
    id: import_zod26.z.uuid()
  });
  const { id } = finishTrainmentParamsSchema.parse(request.params);
  try {
    const finishTrainmentUseCase = makeFinishTrainmentUseCase();
    const { trainment } = await finishTrainmentUseCase.execute({
      userId: request.user.sub,
      trainmentId: id
    });
    return reply.status(200).send({ trainment: trainmentToHTTP(trainment) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    if (err instanceof TrainmentAlreadyFinishedError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/trainments/get-trainment/get-trainment.ts
var import_zod27 = require("zod");

// src/use-cases/trainments/get-trainment/get-trainment.ts
var GetTrainmentUseCase = class {
  constructor(trainmentsRepository) {
    this.trainmentsRepository = trainmentsRepository;
  }
  trainmentsRepository;
  async execute({
    userId,
    trainmentId
  }) {
    const trainment = await this.trainmentsRepository.findById(trainmentId);
    if (!trainment) {
      throw new ResourceNotFoundError();
    }
    if (trainment.user_id !== userId) {
      throw new NotAllowedError();
    }
    return { trainment };
  }
};

// src/use-cases/_factories/make-get-trainment-use-case.ts
function makeGetTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository();
  return new GetTrainmentUseCase(trainmentsRepository);
}

// src/http/controllers/trainments/get-trainment/get-trainment.ts
async function getTrainment(request, reply) {
  const getTrainmentParamsSchema = import_zod27.z.object({
    id: import_zod27.z.uuid()
  });
  const { id } = getTrainmentParamsSchema.parse(request.params);
  try {
    const getTrainmentUseCase = makeGetTrainmentUseCase();
    const { trainment } = await getTrainmentUseCase.execute({
      userId: request.user.sub,
      trainmentId: id
    });
    return reply.status(200).send({ trainment: trainmentToHTTP(trainment) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
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

// src/use-cases/_factories/make-get-weekly-progress-use-case.ts
function makeGetWeeklyProgressUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository();
  const userPreferencesRepository = new PrismaUserPreferencesRepository();
  return new GetWeeklyProgressUseCase(
    trainmentsRepository,
    userPreferencesRepository
  );
}

// src/http/controllers/trainments/get-weekly-progress/get-weekly-progress.ts
async function getWeeklyProgress(request, reply) {
  const getWeeklyProgressUseCase = makeGetWeeklyProgressUseCase();
  const { weekStart, weekEnd, completed, goal, trainments } = await getWeeklyProgressUseCase.execute({
    userId: request.user.sub
  });
  return reply.status(200).send({
    weekStart,
    weekEnd,
    completed,
    goal,
    trainments: trainments.map(trainmentToHTTP)
  });
}

// src/http/controllers/trainments/start-trainment/start-trainment.ts
var import_zod28 = require("zod");

// src/use-cases/trainments/start-trainment/start-trainment.ts
var StartTrainmentUseCase = class {
  constructor(trainmentsRepository, trainmentTemplatesRepository) {
    this.trainmentsRepository = trainmentsRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
  }
  trainmentsRepository;
  trainmentTemplatesRepository;
  async execute({
    userId,
    trainmentTemplateId
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    const trainment = await this.trainmentsRepository.create({
      trainment_template_id: trainmentTemplateId,
      user_id: userId
    });
    return { trainment };
  }
};

// src/use-cases/_factories/make-start-trainment-use-case.ts
function makeStartTrainmentUseCase() {
  const trainmentsRepository = new PrismaTrainmentsRepository();
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  return new StartTrainmentUseCase(
    trainmentsRepository,
    trainmentTemplatesRepository
  );
}

// src/http/controllers/trainments/start-trainment/start-trainment.ts
async function startTrainment(request, reply) {
  const startTrainmentBodySchema = import_zod28.z.object({
    trainmentTemplateId: import_zod28.z.uuid()
  });
  const { trainmentTemplateId } = startTrainmentBodySchema.parse(request.body);
  try {
    const startTrainmentUseCase = makeStartTrainmentUseCase();
    const { trainment } = await startTrainmentUseCase.execute({
      userId: request.user.sub,
      trainmentTemplateId
    });
    return reply.status(201).send({ trainment: trainmentToHTTP(trainment) });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/trainments/sync-trainment/sync-trainment.ts
var import_zod29 = require("zod");

// src/use-cases/errors/sync-conflict-error.ts
var SyncConflictError = class extends Error {
  constructor() {
    super("Sync conflict");
  }
};

// src/repositories/prisma/prisma-trainment-sync-repository.ts
var PrismaTrainmentSyncRepository = class {
  async persistTrainmentGraph(graph) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.trainment.findUnique({ where: { id: graph.id } });
      if (existing && existing.user_id !== graph.userId) {
        throw new SyncConflictError();
      }
      const created = !existing;
      const trainment = await tx.trainment.upsert({
        where: { id: graph.id },
        create: {
          id: graph.id,
          trainment_template_id: graph.trainmentTemplateId,
          user_id: graph.userId,
          started_at: graph.startedAt,
          finished_at: graph.finishedAt
        },
        update: {
          started_at: graph.startedAt,
          finished_at: graph.finishedAt
        }
      });
      const exercises = [];
      const sets = [];
      for (const exerciseInput of graph.exercises) {
        const plannedSets = exerciseInput.plannedSets;
        const exercise = await tx.exercise.upsert({
          where: { id: exerciseInput.id },
          create: {
            id: exerciseInput.id,
            trainment_id: graph.id,
            exercise_template_id: exerciseInput.exerciseTemplateId,
            planned_sets: plannedSets
          },
          update: {
            planned_sets: plannedSets
          }
        });
        exercises.push(exercise);
        for (const setInput of exerciseInput.sets) {
          const set = await tx.set.upsert({
            where: { id: setInput.id },
            create: {
              id: setInput.id,
              trainment_id: graph.id,
              exercise_id: exerciseInput.id,
              user_id: graph.userId,
              // forced from the caller, never the payload
              index: setInput.index,
              weight: setInput.weight,
              repetitions: setInput.repetitions,
              performed_at: setInput.performedAt
            },
            update: {
              index: setInput.index,
              weight: setInput.weight,
              repetitions: setInput.repetitions,
              performed_at: setInput.performedAt,
              user_id: graph.userId
            }
          });
          sets.push(set);
        }
      }
      const event = await tx.event.create({
        data: {
          event_type: "COMPUTE_TRAINMENT_METRICS",
          user_id: graph.userId,
          metadata: { trainmentId: graph.id }
        }
      });
      return { trainment, exercises, sets, created, eventId: event.id };
    });
  }
};

// src/use-cases/sync/sync-trainment/sync-trainment.ts
var SyncTrainmentUseCase = class {
  constructor(trainmentSyncRepository, trainmentTemplatesRepository, exerciseTemplatesRepository, eventQueue) {
    this.trainmentSyncRepository = trainmentSyncRepository;
    this.trainmentTemplatesRepository = trainmentTemplatesRepository;
    this.exerciseTemplatesRepository = exerciseTemplatesRepository;
    this.eventQueue = eventQueue;
  }
  trainmentSyncRepository;
  trainmentTemplatesRepository;
  exerciseTemplatesRepository;
  eventQueue;
  async execute({
    userId,
    id,
    trainmentTemplateId,
    startedAt,
    finishedAt,
    exercises
  }) {
    const trainmentTemplate = await this.trainmentTemplatesRepository.findById(trainmentTemplateId);
    if (!trainmentTemplate) {
      throw new ResourceNotFoundError();
    }
    if (trainmentTemplate.user_id !== userId) {
      throw new NotAllowedError();
    }
    for (const exercise of exercises) {
      const exerciseTemplate = await this.exerciseTemplatesRepository.findById(
        exercise.exerciseTemplateId
      );
      if (!exerciseTemplate) {
        throw new ResourceNotFoundError();
      }
      if (exerciseTemplate.trainment_template_id !== trainmentTemplateId) {
        throw new NotAllowedError();
      }
      this.assertSetInvariant(exercise);
    }
    const result = await this.trainmentSyncRepository.persistTrainmentGraph({
      id,
      trainmentTemplateId,
      userId,
      startedAt,
      finishedAt,
      exercises
    });
    try {
      await this.eventQueue.add({
        eventId: result.eventId,
        eventType: "COMPUTE_TRAINMENT_METRICS",
        metadata: { trainmentId: id }
      });
    } catch (err) {
      console.error("[events] failed to enqueue sync job, sweeper will retry", err);
    }
    return result;
  }
  /**
   * Re-asserts the invariant Zod also enforces at the edge: exactly one set per
   * planned index, with contiguous 1..N indices. Defensive — guards the use-case
   * when invoked outside the HTTP layer (e.g. unit tests, future batch sync).
   */
  assertSetInvariant(exercise) {
    const indices = exercise.sets.map((set) => set.index).sort((a, b) => a - b);
    const contiguous = indices.every((value, position) => value === position + 1);
    if (exercise.sets.length !== plannedSetCount(exercise.plannedSets) || !contiguous) {
      throw new InvalidSetIndexError();
    }
  }
};

// src/use-cases/_factories/make-sync-trainment-use-case.ts
function makeSyncTrainmentUseCase() {
  const trainmentSyncRepository = new PrismaTrainmentSyncRepository();
  const trainmentTemplatesRepository = new PrismaTrainmentTemplatesRepository();
  const exerciseTemplatesRepository = new PrismaExerciseTemplatesRepository();
  const eventQueue = new BullMqEventQueue();
  return new SyncTrainmentUseCase(
    trainmentSyncRepository,
    trainmentTemplatesRepository,
    exerciseTemplatesRepository,
    eventQueue
  );
}

// src/http/controllers/trainments/sync-trainment/sync-trainment.ts
var setSchema = import_zod29.z.object({
  id: import_zod29.z.uuid(),
  index: import_zod29.z.number().int().min(1),
  weight: import_zod29.z.number().min(0).nullable(),
  repetitions: import_zod29.z.number().int().min(0).nullable(),
  performedAt: import_zod29.z.coerce.date()
});
var exerciseSchema = import_zod29.z.object({
  id: import_zod29.z.uuid(),
  exerciseTemplateId: import_zod29.z.uuid(),
  plannedSets: plannedSetsSchema,
  sets: import_zod29.z.array(setSchema)
}).refine((exercise) => exercise.sets.length === Object.keys(exercise.plannedSets).length, {
  message: "sets count must equal plannedSets length"
}).refine(
  (exercise) => {
    const indices = exercise.sets.map((set) => set.index).sort((a, b) => a - b);
    return indices.every((value, position) => value === position + 1);
  },
  { message: "set indices must be contiguous 1..N" }
);
var syncTrainmentBodySchema = import_zod29.z.object({
  id: import_zod29.z.uuid(),
  trainmentTemplateId: import_zod29.z.uuid(),
  startedAt: import_zod29.z.coerce.date(),
  finishedAt: import_zod29.z.coerce.date().nullable(),
  exercises: import_zod29.z.array(exerciseSchema)
});
async function syncTrainment(request, reply) {
  const body = syncTrainmentBodySchema.parse(request.body);
  try {
    const useCase = makeSyncTrainmentUseCase();
    const { trainment, exercises, sets, created } = await useCase.execute({
      userId: request.user.sub,
      id: body.id,
      trainmentTemplateId: body.trainmentTemplateId,
      startedAt: body.startedAt,
      finishedAt: body.finishedAt,
      exercises: body.exercises.map((exercise) => ({
        id: exercise.id,
        exerciseTemplateId: exercise.exerciseTemplateId,
        plannedSets: exercise.plannedSets,
        sets: exercise.sets.map((set) => ({
          id: set.id,
          index: set.index,
          weight: set.weight,
          repetitions: set.repetitions,
          performedAt: set.performedAt
        }))
      }))
    });
    return reply.status(created ? 201 : 200).send({
      trainment: trainmentToHTTP(trainment),
      exercises: exercises.map(exerciseToHTTP),
      sets: sets.map(setToHTTP)
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof NotAllowedError) {
      return reply.status(403).send({ message: err.message });
    }
    if (err instanceof SyncConflictError) {
      return reply.status(409).send({ message: err.message });
    }
    if (err instanceof InvalidSetIndexError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/controllers/trainments/routes.ts
async function trainmentRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.post("/trainments", startTrainment);
  app2.post("/trainments/sync", syncTrainment);
  app2.patch("/trainments/:id/finish", finishTrainment);
  app2.get("/trainments", fetchUserTrainments);
  app2.get("/trainments/weekly-progress", getWeeklyProgress);
  app2.get("/trainments/:id", getTrainment);
}

// src/http/controllers/users/authenticate/authenticate.ts
var import_zod30 = require("zod");

// src/repositories/prisma/prisma-users-repository.ts
var PrismaUsersRepository = class {
  async create(data) {
    return prisma.user.create({ data });
  }
  async findByEmail(email) {
    return prisma.user.findFirst({ where: { email, deleted_at: null } });
  }
  async findByUsername(username) {
    return prisma.user.findFirst({ where: { username, deleted_at: null } });
  }
  async findById(id) {
    return prisma.user.findFirst({ where: { id, deleted_at: null } });
  }
  async save(user) {
    return prisma.user.update({ where: { id: user.id }, data: user });
  }
};

// src/use-cases/authenticate/authenticate.ts
var import_bcryptjs = require("bcryptjs");

// src/use-cases/errors/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

// src/use-cases/authenticate/authenticate.ts
var AuthenticateUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  usersRepository;
  async execute({
    email,
    password
  }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const doesPasswordMatch = await (0, import_bcryptjs.compare)(password, user.password_hash);
    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }
    return { user };
  }
};

// src/use-cases/_factories/make-authenticate-use-case.ts
function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository();
  return new AuthenticateUseCase(usersRepository);
}

// src/http/controllers/users/authenticate/authenticate.ts
async function authenticate(request, reply) {
  const authenticateBodySchema = import_zod30.z.object({
    email: import_zod30.z.email(),
    password: import_zod30.z.string().min(6)
  });
  const { email, password } = authenticateBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUseCase();
    const { user } = await authenticateUseCase.execute({ email, password });
    const token = await reply.jwtSign(
      { role: user.role },
      { sign: { sub: user.id } }
    );
    const refreshToken = await reply.jwtSign(
      { role: user.role },
      { sign: { sub: user.id, expiresIn: "7d" } }
    );
    return reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: true,
      sameSite: true,
      httpOnly: true
    }).status(200).send({ token });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message });
    }
    return reply.status(500).send({ message: "Something went wrong" });
  }
}

// src/http/controllers/users/change-password/change-password.ts
var import_zod31 = require("zod");

// src/use-cases/change-password/change-password.ts
var import_bcryptjs2 = require("bcryptjs");
var ChangePasswordUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  usersRepository;
  async execute({
    userId,
    currentPassword,
    newPassword
  }) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }
    const doesCurrentPasswordMatch = await (0, import_bcryptjs2.compare)(
      currentPassword,
      user.password_hash
    );
    if (!doesCurrentPasswordMatch) {
      throw new InvalidCredentialsError();
    }
    user.password_hash = await (0, import_bcryptjs2.hash)(newPassword, 6);
    const updatedUser = await this.usersRepository.save(user);
    return { user: updatedUser };
  }
};

// src/use-cases/_factories/make-change-password-use-case.ts
function makeChangePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository();
  return new ChangePasswordUseCase(usersRepository);
}

// src/http/controllers/users/change-password/change-password.ts
async function changePassword(request, reply) {
  const changePasswordBodySchema = import_zod31.z.object({
    currentPassword: import_zod31.z.string().min(6),
    newPassword: import_zod31.z.string().min(6)
  });
  const { currentPassword, newPassword } = changePasswordBodySchema.parse(
    request.body
  );
  try {
    const changePasswordUseCase = makeChangePasswordUseCase();
    await changePasswordUseCase.execute({
      userId: request.user.sub,
      currentPassword,
      newPassword
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(204).send();
}

// src/http/controllers/users/refresh/refresh.ts
async function refresh(request, reply) {
  try {
    await request.jwtVerify({ onlyCookie: true });
  } catch {
    return reply.status(401).send({ message: "Unauthorized." });
  }
  const { role } = request.user;
  const token = await reply.jwtSign(
    { role },
    { sign: { sub: request.user.sub } }
  );
  const refreshToken = await reply.jwtSign(
    { role },
    { sign: { sub: request.user.sub, expiresIn: "7d" } }
  );
  return reply.setCookie("refreshToken", refreshToken, {
    path: "/",
    secure: true,
    sameSite: true,
    httpOnly: true
  }).status(200).send({ token });
}

// src/http/controllers/users/register/register.ts
var import_zod32 = require("zod");

// src/use-cases/errors/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("User already exists");
  }
};

// src/use-cases/errors/user-preferences-already-exists-error.ts
var UserPreferencesAlreadyExistsError = class extends Error {
  constructor() {
    super("User preferences already exist");
  }
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

// src/use-cases/_factories/make-create-default-user-preferences-use-case.ts
function makeCreateDefaultUserPreferencesUseCase() {
  const userPreferencesRepository = new PrismaUserPreferencesRepository();
  return new CreateDefaultUserPreferencesUseCase(userPreferencesRepository);
}

// src/use-cases/register/register.ts
var import_bcryptjs3 = require("bcryptjs");
var RegisterUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  usersRepository;
  async execute({
    username,
    email,
    password
  }) {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }
    const userWithSameUsername = await this.usersRepository.findByUsername(username);
    if (userWithSameUsername) {
      throw new UserAlreadyExistsError();
    }
    const password_hash = await (0, import_bcryptjs3.hash)(password, 6);
    const user = await this.usersRepository.create({
      username,
      email,
      password_hash
    });
    return { user };
  }
};

// src/use-cases/_factories/make-register-use-case.ts
function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository();
  return new RegisterUseCase(usersRepository);
}

// src/http/controllers/users/register/register.ts
async function register(request, reply) {
  const registerBodySchema = import_zod32.z.object({
    username: import_zod32.z.string().min(1),
    email: import_zod32.z.email(),
    password: import_zod32.z.string().min(6)
  });
  const { username, email, password } = registerBodySchema.parse(request.body);
  try {
    const registerUseCase = makeRegisterUseCase();
    const { user } = await registerUseCase.execute({
      username,
      email,
      password
    });
    await makeCreateDefaultUserPreferencesUseCase().execute({ userId: user.id });
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(201).send();
}

// src/http/controllers/users/routes.ts
async function userRoutes(app2) {
  app2.post("/users", register);
  app2.post("/sessions", authenticate);
  app2.patch("/token/refresh", refresh);
  app2.patch(
    "/users/password",
    { onRequest: [verifyJWT] },
    changePassword
  );
}

// src/app.ts
var app = (0, import_fastify.default)({
  requestTimeout: 10 * 1e3,
  // 10 seconds
  handlerTimeout: 10 * 1e3
  // 10 seconds
});
app.register(import_jwt.default, {
  secret: env.SECRET_KEY,
  cookie: {
    cookieName: "refreshToken",
    signed: false
  },
  sign: {
    expiresIn: "10m"
  }
});
app.register(import_cookie.default);
app.register(import_static.default, {
  root: import_node_path.default.resolve(process.cwd(), "public"),
  prefix: "/static/"
});
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof import_zod33.ZodError) {
    return reply.status(400).send({
      message: "Validation error.",
      issues: import_zod33.z.treeifyError(error)
    });
  }
  if (env.NODE_ENV !== "prod") {
    console.error(error);
  }
  return reply.status(500).send({ message: "Internal server error." });
});
app.register(healthCheckRoutes);
app.register(userRoutes);
app.register(trainmentTemplateRoutes);
app.register(trainmentRoutes);
app.register(catalogExerciseRoutes);
app.register(exerciseTemplateRoutes);
app.register(exerciseRoutes);
app.register(setRoutes);
app.register(metricRoutes);
app.register(preferenceRoutes);

// src/queues/sweeper.ts
var SWEEP_INTERVAL_MS = 3e4;
var STALE_AFTER_MS = 6e4;
function startEventSweeper() {
  const eventsRepository = new PrismaEventsRepository();
  const queue = new BullMqEventQueue();
  async function sweep() {
    try {
      const cutoff = new Date(Date.now() - STALE_AFTER_MS);
      const stale = await eventsRepository.findStalePending(cutoff);
      for (const event of stale) {
        await queue.add({ eventId: event.id, eventType: event.event_type });
      }
    } catch (err) {
      console.error("[events] sweeper run failed", err);
    }
  }
  const timer = setInterval(sweep, SWEEP_INTERVAL_MS);
  timer.unref();
  return timer;
}

// src/server.ts
app.listen({ host: "0.0.0.0", port: env.PORT }).then(() => {
  console.log(`HTTP Server is running on port ${env.PORT}`);
  startMetricsWorker();
  startEventSweeper();
});
