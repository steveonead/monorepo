import type { ErrorResponse, SuccessResponse } from '@superdsp/api-schemas/base/api';

import { getErrorCode } from '@superdsp/api-schemas/base/api-status-code';

export function ok<T>(data: T, message?: string): SuccessResponse<T> {
  return { statusCode: 'SUCCESS', data, message };
}

export function partialOk<T>(data: T, message?: string): SuccessResponse<T> {
  return { statusCode: 'PARTIAL_SUCCESS', data, message };
}

export function errorWrapper({
  status,
  message,
}: {
  status: number;
  message?: string;
}): ErrorResponse {
  const statusCode = getErrorCode(status);

  return { statusCode, message };
}
