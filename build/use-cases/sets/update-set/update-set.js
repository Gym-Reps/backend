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

// src/use-cases/sets/update-set/update-set.ts
var update_set_exports = {};
__export(update_set_exports, {
  UpdateSetUseCase: () => UpdateSetUseCase
});
module.exports = __toCommonJS(update_set_exports);

// src/use-cases/errors/not-allowed-error.ts
var NotAllowedError = class extends Error {
  constructor() {
    super("Not allowed");
  }
};

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdateSetUseCase
});
