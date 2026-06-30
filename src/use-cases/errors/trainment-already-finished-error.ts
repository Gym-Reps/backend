export class TrainmentAlreadyFinishedError extends Error {
  constructor() {
    super('Trainment already finished')
  }
}
