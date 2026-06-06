import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { getErrorCode } from '@superdsp/api-schemas/base/error-codes';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

function extractMessage(exception: HttpException): string {
  const res = exception.getResponse();
  if (typeof res === 'string') return res;
  if (typeof res === 'object' && res !== null && 'message' in res) {
    const { message } = res as { message: unknown };
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return (message as string[]).join(', ');
  }
  return exception.message;
}

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  override catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const code = getErrorCode(status);
    const message = extractMessage(exception);

    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        this.logger.error(`Serialization error: ${zodError.message}`);
      }
      response.status(status).json({ status: 'error', code, message });
      return;
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        response.status(status).json({
          status: 'error',
          code,
          message,
          errors: zodError.issues.map((issue) => ({ path: issue.path, message: issue.message })),
        });
        return;
      }
    }

    response.status(status).json({ status: 'error', code, message });
  }
}
