---
rule: integration-shared-queryoptions
category: Query + Router 整合
tags: [integration, queryOptions, prefetch, loader, useSuspenseQuery]
---

# Link 預載、loader、component 三階段吃同一份 cache

> 同一筆資料會在三個階段被觸及：`<Link>` hover 預載、route loader 的 `ensureQueryData`、component 的 `useSuspenseQuery`。三者都透過同一個 `queryOptions()` 工廠取用 options（factory 基本原則見 `query-options-factory`），整合才會三階段命中同一份 cache。

## 原因

- 搭配 `router-preload-strategy` 的 `defaultPreload: 'intent'` + `defaultPreloadStaleTime: 0`，hover 連結時 router 呼叫 loader、loader 內 `ensureQueryData` 寫入 cache，進頁後 `useSuspenseQuery` 直接命中，全程不重複發 request
- 只要任一階段手寫 query key，cache 就分裂成兩份 entry：預載寫入 A、component 訂閱 B，預載等於白做、進頁仍要重新 fetch
- 三處共用同一 factory，重構 `queryFn` 或 key 時只改一處，型別也同步生效

## ❌ Bad

```tsx
// loader / component 用 factory，Link 卻在元件內手寫 prefetch
function UserLink({ id }: { id: string }) {
  const queryClient = useQueryClient();
  return (
    <Link
      to="/users/$userId"
      params={{ userId: id }}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ["user", id], // 與 factory 的 ["users", "detail", id] 不一致
          queryFn: () => fetchUser(id),
        });
      }}
    >
      View
    </Link>
  );
}
```

預載寫入 `["user", id]`，loader / component 訂閱 `["users", "detail", id]`，兩個 entry 完全分離。

## ✅ Good

```tsx
// Link 交給 router 自動預載，無需手動 prefetch
<Link to="/users/$userId" params={{ userId: id }}>
  View User
</Link>;
```

```ts
// loader 與 component 同樣取用 userDetailOptions（定義見 query-options-factory）
export const Route = createFileRoute("/users/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userDetailOptions(params.userId)),
  component: UserPage,
});

function UserPage() {
  const { userId } = Route.useParams();
  const { data } = useSuspenseQuery(userDetailOptions(userId));
  return <Profile user={data} />;
}
```

確實需要在非 `<Link>` 元件（如自訂預覽按鈕）手動預載時，仍透過同一個 factory：

```tsx
function PrefetchButton({ id }: { id: string }) {
  const queryClient = useQueryClient();
  return (
    <button onMouseEnter={() => queryClient.prefetchQuery(userDetailOptions(id))}>
      Load preview
    </button>
  );
}
```

## 例外

無。所有涉及同一筆資料的位置都應共用同一個 `queryOptions()` 工廠。
