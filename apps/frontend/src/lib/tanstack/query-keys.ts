// eslint-disable-next-line ts/no-explicit-any
type AnyFactory = (...args: any[]) => readonly unknown[];
type Schema = Record<string, readonly [] | AnyFactory>;

type ResolveEntry<TNamespace extends string, K extends string, TEntry> = TEntry extends readonly []
  ? () => readonly [TNamespace, K]
  : TEntry extends (...args: infer TArgs) => infer TReturn
    ? TReturn extends readonly unknown[]
      ? (...args: TArgs) => readonly [TNamespace, K, ...TReturn]
      : never
    : never;

type QueryKeys<TNamespace extends string, TSchema extends Schema> = {
  all: () => readonly [TNamespace];
} & {
  [K in keyof TSchema & string]: ResolveEntry<TNamespace, K, TSchema[K]>;
};

export function createQueryKeys<TNamespace extends string, TSchema extends Schema>(
  namespace: TNamespace,
  schema: TSchema,
): QueryKeys<TNamespace, TSchema> {
  const result: Record<string, unknown> = {
    all: () => [namespace] as const,
  };

  for (const key of Object.keys(schema)) {
    const entry = schema[key];
    if (typeof entry === 'function') {
      result[key] = (...args: unknown[]) => [namespace, key, ...entry(...args)] as const;
    } else {
      result[key] = () => [namespace, key] as const;
    }
  }

  return result as QueryKeys<TNamespace, TSchema>;
}
