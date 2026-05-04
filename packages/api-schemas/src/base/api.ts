import { z } from 'zod';

export function ApiSuccessResponseSchemaFactory<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ status: z.literal('success'), data: dataSchema.optional() });
}

export const ApiErrorResponseSchema = z.object({ status: z.literal('error'), message: z.string() });

export type ApiSuccessResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof ApiSuccessResponseSchemaFactory<T>>
>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
