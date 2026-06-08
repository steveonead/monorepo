import type { ApiErrorStatusCode } from '@superdsp/api-schemas/base/api-status-code';

export class HttpError extends Error {
  constructor(
    public httpStatus: number,
    public statusCode: ApiErrorStatusCode,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
