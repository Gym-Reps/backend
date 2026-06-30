export class ExerciseAlreadyExistsError extends Error {
  constructor() {
    super('Exercise already exists')
  }
}
