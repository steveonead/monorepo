import type { INestApplication } from '@nestjs/common';

import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '@/app.module';

describe('Campaign (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /campaigns 回傳 200 與非空的 campaign 列表', async () => {
    const res = await request(app.getHttpServer()).get('/campaigns').expect(200);

    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.total).toBeGreaterThan(0);
  });

  it('GET /campaigns 依 page/pageSize 分頁，total 反映全部筆數而非單頁筆數', async () => {
    const baseline = await request(app.getHttpServer()).get('/campaigns?pageSize=100');
    const total = baseline.body.data.total;

    const res = await request(app.getHttpServer()).get('/campaigns?page=1&pageSize=2').expect(200);

    expect(res.body.data.page).toBe(1);
    expect(res.body.data.pageSize).toBe(2);
    expect(res.body.data.total).toBe(total);
    expect(res.body.data.items).toHaveLength(Math.min(2, total));
  });

  it('GET /campaigns 第二頁回傳後續項目', async () => {
    const firstPage = await request(app.getHttpServer()).get('/campaigns?page=1&pageSize=2');
    const secondPage = await request(app.getHttpServer()).get('/campaigns?page=2&pageSize=2');

    const firstIds = firstPage.body.data.items.map((c: { id: string }) => c.id);
    const secondIds = secondPage.body.data.items.map((c: { id: string }) => c.id);

    expect(secondPage.body.data.items).toHaveLength(2);
    expect(secondIds).not.toEqual(firstIds);
    expect(firstIds).not.toContain(secondIds[0]);
  });

  it('GET /campaigns?status= 只回傳符合 status 的項目，total 反映篩選後筆數', async () => {
    const res = await request(app.getHttpServer()).get('/campaigns?status=PAUSED').expect(200);

    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items.every((c: { status: string }) => c.status === 'PAUSED')).toBe(true);
    expect(res.body.data.total).toBe(res.body.data.items.length);
  });

  it('POST /campaigns 建立 campaign 並回傳 201 與含 id 的 detail', async () => {
    const res = await request(app.getHttpServer())
      .post('/campaigns')
      .send({
        name: 'Autumn Campaign',
        status: 'ACTIVE',
        advertiserName: 'New Advertiser',
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        budgetTwd: 88000,
      })
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toEqual(expect.any(String));
    expect(res.body.data.name).toBe('Autumn Campaign');
  });

  it('POST /campaigns 的 name 超過 100 字回傳 400', async () => {
    await request(app.getHttpServer())
      .post('/campaigns')
      .send({
        name: 'a'.repeat(101),
        status: 'ACTIVE',
        advertiserName: 'New Advertiser',
        startDate: '2026-09-01',
        endDate: null,
      })
      .expect(400);
  });

  it('PATCH /campaigns/:id 更新既有 campaign 並回傳 detail', async () => {
    const created = await request(app.getHttpServer()).post('/campaigns').send({
      name: 'Before Update',
      status: 'DRAFT',
      advertiserName: 'Advertiser X',
      startDate: '2026-05-01',
      endDate: null,
      budgetTwd: 10000,
    });
    const id = created.body.data.id;

    const res = await request(app.getHttpServer())
      .patch(`/campaigns/${id}`)
      .send({
        name: 'After Update',
        status: 'ACTIVE',
        advertiserName: 'Advertiser X',
        startDate: '2026-05-01',
        endDate: '2026-12-31',
        budgetTwd: 20000,
      })
      .expect(200);

    expect(res.body.data.id).toBe(id);
    expect(res.body.data.name).toBe('After Update');
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('PATCH /campaigns/:id 只送單一欄位時，只更新該欄位、其餘保留', async () => {
    const created = await request(app.getHttpServer()).post('/campaigns').send({
      name: 'Partial Before',
      status: 'DRAFT',
      advertiserName: 'Partial Advertiser',
      startDate: '2026-05-01',
      endDate: null,
      budgetTwd: 30000,
    });
    const id = created.body.data.id;

    const res = await request(app.getHttpServer())
      .patch(`/campaigns/${id}`)
      .send({ name: 'Partial After' })
      .expect(200);

    expect(res.body.data.name).toBe('Partial After');
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.advertiserName).toBe('Partial Advertiser');
    expect(res.body.data.budgetTwd).toBe(30000);
  });

  it('PATCH /campaigns/:id 對不存在的 id 回傳 404', async () => {
    await request(app.getHttpServer())
      .patch('/campaigns/00000000-0000-0000-0000-000000000000')
      .send({
        name: 'Ghost',
        status: 'ACTIVE',
        advertiserName: 'Nobody',
        startDate: '2026-05-01',
        endDate: null,
      })
      .expect(404);
  });

  it('DELETE /campaigns/:id 移除 campaign 並回傳 204', async () => {
    const created = await request(app.getHttpServer()).post('/campaigns').send({
      name: 'To Be Deleted',
      status: 'ACTIVE',
      advertiserName: 'Advertiser Y',
      startDate: '2026-05-01',
      endDate: null,
    });
    const id = created.body.data.id;

    await request(app.getHttpServer()).delete(`/campaigns/${id}`).expect(204);
    // 再次刪除應回 404，證明已移除
    await request(app.getHttpServer()).delete(`/campaigns/${id}`).expect(404);
  });

  it('DELETE /campaigns/:id 對不存在的 id 回傳 404', async () => {
    await request(app.getHttpServer())
      .delete('/campaigns/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
