import { z } from 'zod';

// Error
const API_ERROR_STATUS_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'INTERNAL_SERVER_ERROR',
] as const;

export const ErrorCodeSchema = z.enum(API_ERROR_STATUS_CODES);

export type ApiErrorStatusCode = (typeof API_ERROR_STATUS_CODES)[number];

const HTTP_STATUS_TO_ERROR_CODE: Record<number, ApiErrorStatusCode> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  500: 'INTERNAL_SERVER_ERROR',
};

export function getErrorCode(status: number): ApiErrorStatusCode {
  return HTTP_STATUS_TO_ERROR_CODE[status] ?? 'INTERNAL_SERVER_ERROR';
}

// Success
const API_SUCCESS_STATUS_CODES = ['SUCCESS', 'PARTIAL_SUCCESS'] as const;

export const SuccessCodeSchema = z.enum(API_SUCCESS_STATUS_CODES);

export type ApiSuccessStatusCode = (typeof API_SUCCESS_STATUS_CODES)[number];

export function getSuccessCode(option?: { partial: boolean }): ApiSuccessStatusCode {
  const { partial } = option ?? {};
  return partial ? 'PARTIAL_SUCCESS' : 'SUCCESS';
}
