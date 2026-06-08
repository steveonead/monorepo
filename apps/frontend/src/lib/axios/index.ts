import type { AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';

import { ErrorResponseSchema } from '@superdsp/api-schemas/base/api';
import { getErrorCode } from '@superdsp/api-schemas/base/api-status-code';
import axios from 'axios';

import { HttpError } from '@/lib/axios/http-error';
import { isMockoonEnabled } from '@/lib/env';

const instance = axios.create({
  baseURL: isMockoonEnabled ? '/mockoon/' : '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 把 AxiosError 映射成統一的 HttpError：能 parse 成 ErrorResponseSchema 就帶上 statusCode 與 message，
    // 否則用 HTTP status 對應的 fallback code。無 response 的網路錯誤維持原樣，才會走預設重試。
    if (axios.isAxiosError(error) && error.response) {
      const httpStatus = error.response.status;
      const parsed = ErrorResponseSchema.safeParse(error.response.data);

      if (parsed.success) {
        return Promise.reject(
          new HttpError(httpStatus, parsed.data.statusCode, parsed.data.message ?? error.message),
        );
      }

      return Promise.reject(new HttpError(httpStatus, getErrorCode(httpStatus), error.message));
    }

    return Promise.reject(error);
  },
);

type RequestOptions<T> = {
  schema: ZodType<T>;
};

export async function sendRequest<T>(config: AxiosRequestConfig, options: RequestOptions<T>) {
  const { schema } = options;

  const response = await instance.request(config);

  return schema.parse(response.data);
}
