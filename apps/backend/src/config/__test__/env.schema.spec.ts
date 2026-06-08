import { describe, expect, it } from 'vitest';

import { EnvSchema } from '@/config/env.schema';

describe('envSchema', () => {
  it('未提供 NODE_ENV 時預設為 production，避免 prod 漏設導致錯誤細節外洩（fail-closed）', () => {
    const env = EnvSchema.parse({});
    expect(env.NODE_ENV).toBe('production');
  });

  it('明確指定 development 時保留 development，本地開發仍可看到錯誤細節', () => {
    const env = EnvSchema.parse({ NODE_ENV: 'development' });
    expect(env.NODE_ENV).toBe('development');
  });
});
