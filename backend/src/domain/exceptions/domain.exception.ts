import { AppException } from './app.exception';

export class DomainException extends AppException {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}
