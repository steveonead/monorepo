type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_SERVER_ERROR'
  | 'UNKNOWN_ERROR';

const HTTP_ERROR_CODES = new Map<number, ErrorCode>([
  [400, 'VALIDATION_ERROR'],
  [401, 'UNAUTHORIZED'],
  [403, 'FORBIDDEN'],
  [404, 'NOT_FOUND'],
  [409, 'CONFLICT'],
  [422, 'UNPROCESSABLE_ENTITY'],
  [500, 'INTERNAL_SERVER_ERROR'],
]);

export function getErrorCode(status: number): ErrorCode {
  return HTTP_ERROR_CODES.get(status) ?? 'UNKNOWN_ERROR';
}
