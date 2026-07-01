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

// src/use-cases/events/enqueue-event/enqueue-event.ts
var enqueue_event_exports = {};
__export(enqueue_event_exports, {
  EnqueueEventUseCase: () => EnqueueEventUseCase
});
module.exports = __toCommonJS(enqueue_event_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnqueueEventUseCase
});
