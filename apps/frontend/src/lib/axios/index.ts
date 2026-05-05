import type { AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';

import axios from 'axios';

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
