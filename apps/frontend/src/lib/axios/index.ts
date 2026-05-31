import type { AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';

import axios from 'axios';

import { HttpError } from '@/lib/axios/http-error';
import { isMockoonEnabled } from '@/lib/env';

const instance = axios.create({
  baseURL: isMockoonEnabled ? '/mockoon/' : '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 把 AxiosError 映射成統一的 HttpError，讓 query 層 retry/error 判斷拿得到 status；
    // 無 response 的網路錯誤維持原樣，才會走預設重試。
    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject(
        new HttpError(error.response.status, error.message, error.response.data),
      );
    }

    return Promise.reject(error);
  },
);

type RequestOptions<T> = {
  schema?: ZodType<T>;
};

export async function sendRequest<T>(config: AxiosRequestConfig, options?: RequestOptions<T>) {
  const { schema } = options ?? {};

  const response = await instance.request<T>(config);

  if (!schema) {
    return response.data;
  }

  return schema.parse(response.data);
}
