import { z } from 'zod';

export function createApiSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ status: z.literal('success'), data: dataSchema });
}

export type ApiSuccessResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createApiSuccessSchema<T>>
>;

export const ApiErrorSchema = z.object({
  status: z.literal('error'),
  code: z.string(),
  message: z.string(),
  errors: z
    .array(
      z.object({
        path: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]),
        message: z.string(),
      }),
    )
    .optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorSchema>;

export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion('status', [createApiSuccessSchema(dataSchema), ApiErrorSchema]);
}

export type ApiResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof createApiResponseSchema<T>>
>;
