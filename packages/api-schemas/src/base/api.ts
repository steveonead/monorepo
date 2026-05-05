import { z } from 'zod';

export function createApiSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ status: z.literal('success'), data: dataSchema });
}

export type ApiSuccessResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createApiSuccessSchema<T>>
>;

export function createApiErrorSchema() {
  return z.object({ status: z.literal('error'), message: z.string() });
}

export type ApiErrorResponse = z.infer<ReturnType<typeof createApiErrorSchema>>;

export function createResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.union([createApiSuccessSchema(dataSchema), createApiErrorSchema()]);
}
