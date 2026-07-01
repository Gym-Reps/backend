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

// src/use-cases/change-password/change-password.ts
var change_password_exports = {};
__export(change_password_exports, {
  ChangePasswordUseCase: () => ChangePasswordUseCase
});
module.exports = __toCommonJS(change_password_exports);
var import_bcryptjs = require("bcryptjs");

// src/use-cases/errors/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found");
  }
};

// src/use-cases/change-password/change-password.ts
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
    const doesCurrentPasswordMatch = await (0, import_bcryptjs.compare)(
      currentPassword,
      user.password_hash
    );
    if (!doesCurrentPasswordMatch) {
      throw new InvalidCredentialsError();
    }
    user.password_hash = await (0, import_bcryptjs.hash)(newPassword, 6);
    const updatedUser = await this.usersRepository.save(user);
    return { user: updatedUser };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChangePasswordUseCase
});
