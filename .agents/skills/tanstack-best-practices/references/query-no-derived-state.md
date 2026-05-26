---
rule: query-no-derived-state
category: Query 資料管理
tags: [query, state, derived-state, useEffect, anti-pattern]
---

# 不要把 query data 複製進 `useState` 或外部 store

> 在 `useEffect` 內 `setState(data)`，或把 query 結果寫入 Zustand / Redux，會立刻產生落後的衍生狀態。需要衍生值改用 `select`，需要可編輯的 draft 改用 form state，不要複製 cache 內容。

## 原因

- TanStack Query 本身即為 cache，再另開一份 `useState` 等同於存在兩個事實來源，refetch 或 invalidate 後 local state 將持續落後一個更新週期
- 衍生值（filter、map、sort）應於 `useSuspenseQuery({ ..., select })` 的 subscription 層處理，TanStack Query 的 structural sharing 會保持 reference 穩定
- 表單編輯這類需要 dirty state 的場景，應由 form library 管理 draft state，而非以 `useEffect` 把 server data 搬進 local state

## ❌ Bad

```tsx
function UserEditor({ id }: { id: string }) {
  const { data: user } = useSuspenseQuery(userDetailOptions(id));
  const [name, setName] = useState("");

  // refetch 完成或 cache invalidate 後，name 仍為舊值
  useEffect(() => {
    setName(user.name);
  }, [user]);

  return (
    <input value={name} onChange={(event) => setName(event.target.value)} />
  );
}
```

```tsx
// 把 query data 同步進 Zustand store
const { data: users } = useSuspenseQuery(userListOptions());
useEffect(() => {
  useUserStore.setState({ users });
}, [users]);
```

## ✅ Good

```tsx
// 衍生值用 select
function UserName({ id }: { id: string }) {
  const name = useSuspenseQuery({
    ...userDetailOptions(id),
    select: (user) => user.name,
  }).data;
  return <span>{name}</span>;
}

// 表單編輯用 form library 管 draft，提交時送 mutation
function UserEditor({ id }: { id: string }) {
  const { data: user } = useSuspenseQuery(userDetailOptions(id));
  const form = useForm({ defaultValues: user });
  const mutation = useMutation({ mutationFn: updateUser });

  return (
    <form onSubmit={form.handleSubmit(mutation.mutate)}>
      <input {...form.register("name")} />
    </form>
  );
}
```

## 例外

純 UI state（modal 開關、選取的 row id、tooltip 顯示）與 server data 無關，本來就應該使用 `useState`。核心原則是「不要鏡像 server data」。
