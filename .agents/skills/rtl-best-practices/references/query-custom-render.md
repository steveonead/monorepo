---
rule: query-custom-render
category: query
tags: [query, render, provider, test-utils]
---

# Custom Render Helper

> 多個測試共用 Provider 時，建立 custom render helper 並覆蓋 `render`，讓測試只需從一個地方 import。

## 原因

- 測試只從 `test-utils` import，不需同時引入 `@testing-library/react`
- `wrapper` option 比直接 JSX 包覆更具擴展性，新增 Provider 不需改動每個測試
- `screen`、`waitFor` 等工具從同一入口具名 re-export，測試不需多處 import

## ❌ Bad

```tsx
// 每個測試重複包 Provider
import { render } from '@testing-library/react';

render(
  <QueryClientProvider client={new QueryClient()}>
    <MyComponent />
  </QueryClientProvider>,
);
```

Provider 邏輯散落各測試，新增或修改 Provider 要改所有檔案。

## ✅ Good

```tsx
// test-utils.tsx
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';

function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { screen, waitFor, waitForElementToBeRemoved, within, fireEvent, act, renderHook } from '@testing-library/react';
export { customRender as render };
```

```tsx
// 測試中只從 test-utils import
import { render, screen } from '../test-utils';

render(<MyComponent />);
```

統一入口，Provider 變動只需改 `test-utils.tsx`。
