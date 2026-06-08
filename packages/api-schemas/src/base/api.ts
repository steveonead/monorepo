import { z } from 'zod';

import type { ApiSuccessStatusCode } from '@/base/api-status-code';

import { ErrorCodeSchema, SuccessCodeSchema } from '@/base/api-status-code';

export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    statusCode: SuccessCodeSchema,
    data: dataSchema,
    message: z.string().optional(),
  });
}

export const ErrorResponseSchema = z.object({
  statusCode: ErrorCodeSchema,
  message: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type SuccessResponse<TData> = {
  statusCode: ApiSuccessStatusCode;
  data: TData;
  message?: string;
};
