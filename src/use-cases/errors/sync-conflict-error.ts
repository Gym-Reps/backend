export class SyncConflictError extends Error {
  constructor() {
    super('Sync conflict')
  }
}
