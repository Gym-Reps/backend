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

// src/http/controllers/healthcheck/routes.ts
var routes_exports = {};
__export(routes_exports, {
  healthCheckRoutes: () => healthCheckRoutes
});
module.exports = __toCommonJS(routes_exports);

// src/http/controllers/healthcheck/healthcheck.ts
async function getHealthCheck(request, reply) {
  return reply.status(200).send({
    message: "Server is healthy"
  });
}

// src/http/controllers/healthcheck/routes.ts
async function healthCheckRoutes(app) {
  app.get("/healthcheck", getHealthCheck);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  healthCheckRoutes
});
