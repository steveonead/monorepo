import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { z, ZodError } from 'zod';

import type { Env } from '@/config/env.schema';

import { error } from '@/common/utils/api-response';

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

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ method: string; url: string }>();
    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production';
    const req = `${request.method} ${request.url}`;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (exception instanceof ZodValidationException) {
        const zodError = exception.getZodError();
        if (isZodError(zodError)) {
          this.logger.warn(`[${req}] 請求驗證錯誤:\n${z.prettifyError(zodError)}`);
        }
        response.status(status).json(error({ status, message: '請求資料格式錯誤' }));
        return;
      }

      if (exception instanceof ZodSerializationException) {
        const zodError = exception.getZodError();
        if (isZodError(zodError)) {
          this.logger.error(`[${req}] 回應序列化錯誤:\n${z.prettifyError(zodError)}`);
        }
        response.status(status).json(error({ status, message: '回應資料格式錯誤' }));
        return;
      }

      const extracted = extractMessage(exception);
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(`[${req}] ${status} ${extracted}`);
      } else {
        this.logger.warn(`[${req}] ${status} ${extracted}`);
      }

      const message =
        isProd && status >= HttpStatus.INTERNAL_SERVER_ERROR
          ? '系統發生錯誤，請稍候再試'
          : extracted;
      response.status(status).json(error({ status, message }));
      return;
    }

    const unknownError = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(`[${req}] ${unknownError.stack ?? unknownError.message}`);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      error({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: isProd ? '系統發生錯誤，請稍候再試' : unknownError.message,
      }),
    );
  }
}
