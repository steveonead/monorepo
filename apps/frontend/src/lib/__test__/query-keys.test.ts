import { createQueryKeys } from '@/lib/tanstack/query-keys';

const userKeys = createQueryKeys('users', {
  list: [],
  detail: (id: string) => [id],
  search: (query: string, page: number) => [query, page],
});

describe('createQueryKeys', () => {
  it('all() returns namespace key', () => {
    expect(userKeys.all()).toEqual(['users']);
  });

  it('static entry returns [namespace, key]', () => {
    expect(userKeys.list()).toEqual(['users', 'list']);
  });

  it('factory entry appends args to [namespace, key]', () => {
    expect(userKeys.detail('123')).toEqual(['users', 'detail', '123']);
  });

  it('factory with multiple args spreads all into key', () => {
    expect(userKeys.search('alice', 2)).toEqual(['users', 'search', 'alice', 2]);
  });
});
