import type { ErrorResponse, SuccessResponse } from '@superdsp/api-schemas/base/api';

import { getErrorCode, getSuccessCode } from '@superdsp/api-schemas/base/api-status-code';

export function ok<T>(data: T, message?: string): SuccessResponse<T> {
  return { statusCode: getSuccessCode({ partial: false }), data, message };
}

export function partialOk<T>(data: T, message?: string): SuccessResponse<T> {
  return { statusCode: getSuccessCode({ partial: true }), data, message };
}

export function error({ status, message }: { status: number; message?: string }): ErrorResponse {
  const statusCode = getErrorCode(status);

  return { statusCode, message };
}
