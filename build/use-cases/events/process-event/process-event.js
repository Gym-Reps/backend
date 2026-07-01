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

// src/use-cases/events/process-event/process-event.ts
var process_event_exports = {};
__export(process_event_exports, {
  ProcessEventUseCase: () => ProcessEventUseCase
});
module.exports = __toCommonJS(process_event_exports);

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ProcessEventUseCase
});
