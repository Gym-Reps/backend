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

// src/use-cases/trainments/finish-trainment/finish-trainment.ts
var finish_trainment_exports = {};
__export(finish_trainment_exports, {
  FinishTrainmentUseCase: () => FinishTrainmentUseCase
});
module.exports = __toCommonJS(finish_trainment_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FinishTrainmentUseCase
});
