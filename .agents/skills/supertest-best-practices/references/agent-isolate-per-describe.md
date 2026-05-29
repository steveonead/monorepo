---
rule: agent-isolate-per-describe
category: Agent
tags: [agent, isolation, describe]
---

# agent 不跨 describe 共用

> 每個 describe 各自建立新 agent，避免 session 狀態互相污染

## 原因

- agent 儲存 session cookie，跨 describe 共用後各 suite 的 login 狀態會互相影響
- 造成測試順序相依，單獨執行某個 describe 結果可能與全部一起跑時不同

## ❌ Bad

```typescript
const agent = request.agent(app.getHttpServer()); // 頂層共用

describe('GET /profile', () => {
  it('returns user data', async () => {
    await agent.get('/profile').expect(200);
  });
});

describe('GET /settings', () => {
  it('returns settings', async () => {
    await agent.get('/settings').expect(200); // 依賴前一個 describe 的 login 狀態
  });
});
```

兩個 describe 共用一個 agent，執行順序影響測試結果。

## ✅ Good

```typescript
describe('GET /profile', () => {
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    agent = request.agent(app.getHttpServer());
    await agent.post('/auth/login').send({ email: 'a@b.com', password: 'pw' });
  });

  it('returns user data', async () => {
    await agent.get('/profile').expect(200);
  });
});
```

每個 describe 各自建立 agent，相互隔離。
