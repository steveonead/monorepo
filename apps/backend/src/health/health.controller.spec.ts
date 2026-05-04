import { HealthController } from '@/health/health.controller';

describe('healthController', () => {
  it('returns ok status', () => {
    const controller = new HealthController();
    expect(controller.check()).toEqual({ status: 'ok' });
  });
});
