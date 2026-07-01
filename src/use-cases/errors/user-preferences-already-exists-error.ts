export class UserPreferencesAlreadyExistsError extends Error {
  constructor() {
    super('User preferences already exist')
  }
}
