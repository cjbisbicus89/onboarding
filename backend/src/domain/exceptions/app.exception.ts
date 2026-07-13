export abstract class AppException extends Error {
  abstract readonly status: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
