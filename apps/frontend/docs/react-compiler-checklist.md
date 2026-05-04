# React Compiler 整合指引

> **模式**：Annotation mode (`compilationMode: 'annotation'`)
> **意義**：完全 opt-in。不加 directive 的 component 完全不動。

## 設定現況

```ts
// vite.config.ts
react(),
babel({
  presets: [reactCompilerPreset({ compilationMode: 'annotation' })],
}),
```

加 `"use memo"` → Compiler 自動 memoize。
加 `"use no memo"` → 明確 opt-out，Compiler 略過。

---

## 速查表

| 套件 / 用法                               | 指令               | 備註                        |
| ----------------------------------------- | ------------------ | --------------------------- |
| TanStack Query — 所有 hooks               | `"use memo"` ✅    | 架構符合 Rules of React     |
| TanStack Router — 大多數 hooks            | `"use memo"` ✅    | 見下方 hook 列表            |
| TanStack Router — `useMatchRoute`         | `"use no memo"` ⚠️ | 已有 fix PR，版本未確認     |
| TanStack Router — `<Link>` inline objects | `"use memo"`       | 無害但無效，傳 memoized ref |
| TanStack Form — `useForm` / `useAppForm`  | `"use memo"` ✅    |                             |
| TanStack Form — `useFieldContext`         | `"use memo"` ✅    | 寫法有規則，見下方          |
| TanStack Form — 把 `field` 傳子 component | 傳值不傳物件 ⚠️    |                             |
| TanStack Table v8 — 任何使用點            | `"use no memo"` ❌ | 根本不相容，官方已列黑名單  |
| TanStack Table v9 alpha                   | 實驗性 ⚠️          | 靜態解構 `useTable`，見下方 |

---

## TanStack Router

### ✅ 安全的 hooks

| Hook                         | 原因                              |
| ---------------------------- | --------------------------------- |
| `useNavigate`                | stable function ref               |
| `useParams`                  | immutable snapshot                |
| `useSearch`                  | 內部 `replaceEqualDeep`，結構共享 |
| `useRouterState({ select })` | 有 selector → 精準訂閱            |
| `useMatches`                 | immutable array                   |
| `useLoaderData`              | immutable loader snapshot         |
| `useRouteContext`            | stable ref                        |

### ⚠️ `useMatchRoute` — 隔離處理

根本原因：hook 內部 `useCallback` 的依賴陣列遺漏 router mutable state（stale closure）。  
Fix PR [#6561](https://github.com/TanStack/router/issues/4499)（Jan 2026）已提交，但需確認版本是否包含修復：

```bash
gh pr view 6561 --repo TanStack/router --json mergedAt,baseRefName
```

**保險寫法（無論版本）**：包成自訂 hook 隔離：

```tsx
// hooks/use-active-route.ts
function useIsActiveRoute(to: string, fuzzy = false) {
  'use no memo';
  const matchRoute = useMatchRoute();
  return !!matchRoute({ to, fuzzy });
}
```

### ⚠️ `<Link>` inline object props

inline object 每次 render 都是新 ref，memoization 白費（無害但無效）：

```tsx
// ⚠️ search/params 每次都是新 object，Compiler memoize 無意義
<Link
  to="/foo"
  search={{ page: 1 }}
  params={{ id }}
/>;

// ✅ 在呼叫端先 memo
const search = useMemo(() => ({ page: 1 }), []);
<Link
  to="/foo"
  search={search}
  params={{ id }}
/>;
```

---

## TanStack Form

版本要求：`@tanstack/react-form >= 0.39.0`（含 2025-12 PR #1893 的版本更佳）

### ✅ 安全用法

```tsx
export function MyForm() {
  'use memo';
  const form = useAppForm({ defaultValues: { name: '' } });
  return (
    <form.AppForm>
      <form.AppField
        name="name"
        children={(field) => <TextField />}
      />
    </form.AppForm>
  );
}
```

### ⚠️ `useFieldContext` 寫法規則

`field` object 是 stable reference，`field.state` 是 getter。
Compiler 見 `field` stable → 可能跳過 `field.state.value` 的更新。

```tsx
// ❌ ternary 內直接用 field.state.value → Compiler 以 field（stable）為依賴，不更新
export function TextField({ label }: { label: string }) {
  'use memo';
  const field = useFieldContext<string>();
  return canShow ? <input value={field.state.value} /> : null;
}

// ✅ 先解出值
export function TextField({ label }: { label: string }) {
  'use memo';
  const field = useFieldContext<string>();
  const value = field.state.value; // Compiler 能正確追蹤此依賴
  return canShow ? <input value={value} /> : null;
}

// ✅ 或解構
const {
  handleChange,
  state: { value },
} = useFieldContext<string>();

// ✅ memoized child component 內 — 用精準訂閱
const value = useStore(field.store, (s) => s.value);
```

### ⚠️ 傳 `field` 給子 component

```tsx
// ❌ 子 component memoized 後 field ref 穩定 → 看不到 state 更新
<MemoizedInput field={field} />

// ✅ 傳值，不傳物件
<MemoizedInput
  value={field.state.value}
  onChange={field.handleChange}
  onBlur={field.handleBlur}
/>
```

---

## TanStack Table

### v8 — ❌ 根本不相容

React Compiler 官方將 `@tanstack/react-table` 列入 **incompatible library 清單**（`DefaultModuleTypeProvider.ts`）。

根本原因：`useReactTable()` 回傳 mutable table 物件（in-place mutation），違反 React 不可變更新規則。

**所有使用 `useReactTable()` 的 component 強制加 `"use no memo"`：**

```tsx
// ❌ 會導致 table 不更新、sorting/filtering/checkbox 失效
export function DataTable<TData>({ data, columns }: DataTableProps<TData>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return table.getRowModel().rows.map((row) => /* ... */);
}

// ✅ 正確
export function DataTable<TData>({ data, columns }: DataTableProps<TData>) {
  "use no memo";
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return table.getRowModel().rows.map((row) => /* ... */);
}
```

ESLint 會在加了 `"use no memo"` 後仍顯示警告（這是 warning 不是 error）：

```
Compilation Skipped: Use of incompatible library
TanStack Table's `useReactTable()` API returns functions that cannot be memoized safely.
```

若想消除警告：

```tsx
// eslint-disable-next-line react-hooks/incompatible-library
const table = useReactTable({ ... });
```

### v9 alpha — ⚠️ 實驗性

v9 正在以 TanStack Store 重構為 immutable update 架構（最新 alpha.37，2026-04），尚無 stable 版本。

已知規則：若用 `createTableHelper`，必須在 component **外部** 靜態解構 `useTable`：

```tsx
// ✅ 在 module 層級解構（component 外部）
const { useTable, createColumnHelper } = tableHelper;

export function MyTable() {
  'use memo'; // v9 alpha 才可嘗試
  const table = useTable({
    /* ... */
  });
}

// ❌ 不可在 component 內用 tableHelper.useTable()
export function MyTable() {
  const table = tableHelper.useTable({
    /* ... */
  }); // Compiler 視為不穩定 hook
}
```

> **建議**：v9 正式 stable 前，v8 專案一律維持 `"use no memo"` 隔離策略。

---

## 採用策略（由下往上）

1. **先從 leaf component 開始**：無子 component 依賴、不用 TanStack Table 的純展示 component
2. **加 `"use memo"`，跑 lint**：`pnpm lint`，零 violation 才往上層走
3. **Form field components**：確認 `useFieldContext` 存取方式正確後加
4. **Router page components**：確認無 `useMatchRoute` 後加
5. **Table components**：一律維持 `"use no memo"`，等 v9 stable

---

## 參考

- [TanStack Table v8 × React Compiler (facebook/react#33057)](https://github.com/facebook/react/issues/33057)
- [TanStack Table issue #5567](https://github.com/TanStack/table/issues/5567)
- [TanStack Table v9 RFC](https://github.com/TanStack/table/discussions/5834)
- [TanStack Form React Compiler fix PR #1035](https://github.com/TanStack/form/pull/1035)
- [TanStack Form React Compiler fix PR #1893](https://github.com/TanStack/form/pull/1893)
- [TanStack Router useMatchRoute bug #4499](https://github.com/TanStack/router/issues/4499)
- [TanStack Router fix PR #6561](https://github.com/TanStack/router/pull/6561)
- [React incompatible-library ESLint rule](https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library)
