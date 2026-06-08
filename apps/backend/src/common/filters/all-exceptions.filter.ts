import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

import type { Env } from '@/config/env.schema';

import { errorWrapper } from '@/common/utils/api-response';

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

function formatZodIssues(error: ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (exception instanceof ZodSerializationException) {
        const zodError = exception.getZodError();
        if (zodError instanceof ZodError) {
          this.logger.error(`Serialization error: ${zodError.message}`);
        }
        response.status(status).json(errorWrapper({ status, message: extractMessage(exception) }));
        return;
      }

      if (exception instanceof ZodValidationException) {
        const zodError = exception.getZodError();
        const message =
          zodError instanceof ZodError ? formatZodIssues(zodError) : extractMessage(exception);
        response.status(status).json(errorWrapper({ status, message }));
        return;
      }

      // 5xx HttpException 可能挾帶內部細節，prod 一律隱藏；4xx 為 client error，保留 message。
      const message =
        isProd && status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : extractMessage(exception);
      response.status(status).json(errorWrapper({ status, message }));
      return;
    }

    // 非 HttpException：未預期錯誤。記錄原始 stack 以利除錯，prod 不向外洩漏細節。
    const error = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(error.stack ?? error.message);

    const message = isProd ? 'Internal server error' : error.message;

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorWrapper({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      }),
    );
  }
}
