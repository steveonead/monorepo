import { createQueryKeys } from '@/lib/tanstack/query-keys';

const userKeys = createQueryKeys('users', {
  list: [],
  detail: (id: string) => [id],
  search: (query: string, page: number) => [query, page],
});

describe('createQueryKeys', () => {
  it('all() 回傳 namespace 的頂層 key', () => {
    expect(userKeys.all()).toEqual(['users']);
  });

  it('靜態 entry 回傳 [namespace, key]', () => {
    expect(userKeys.list()).toEqual(['users', 'list']);
  });

  it('factory entry 將單一參數附加至 [namespace, key] 之後', () => {
    expect(userKeys.detail('123')).toEqual(['users', 'detail', '123']);
  });

  it('factory 傳入多個參數時，全部展開進 key', () => {
    expect(userKeys.search('alice', 2)).toEqual(['users', 'search', 'alice', 2]);
  });
});
