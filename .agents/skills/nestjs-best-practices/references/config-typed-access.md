---
rule: config-typed-access
category: 設定管理
tags: [config, typed, registerAs]
---

# 用 registerAs + ConfigType 取 typed config

> 設定分組用 `registerAs` 定義 namespace，再用 `@Inject(xConfig.KEY)` 注入 `ConfigType<typeof xConfig>` 取值，不要在各處直接讀 `process.env`。

## 原因

- 各處直接讀 `process.env` 會讓設定無法集中管理，也拿不到型別，key 打錯不會被發現。
- `registerAs` 把相關設定分組成 typed config，注入後欄位有型別、有自動完成。
- 注入分組後的 config 物件取值，讀取集中、可測試，不直接耦合到 `process.env`。

## ❌ Bad

```ts
@Injectable()
export class StorageService {
  upload(file: Buffer) {
    // 各處直接讀 process.env，key 打錯不會報錯，且沒型別
    const bucket = process.env.S3_BUKCET; // typo 不會被發現
    const region = process.env.S3_REGION;
  }
}
```

直接讀 `process.env`，typo 與缺漏無從察覺，型別也是 `string | undefined`。

## ✅ Good

```ts
export const s3Config = registerAs('s3', () => ({
  bucket: process.env.S3_BUCKET!,
  region: process.env.S3_REGION!,
}));

@Injectable()
export class StorageService {
  constructor(
    @Inject(s3Config.KEY)
    private readonly config: ConfigType<typeof s3Config>,
  ) {}

  upload(file: Buffer) {
    const { bucket, region } = this.config; // typed，欄位有自動完成
  }
}
```

設定分組成 `s3` namespace，注入後是 typed 物件，欄位打錯編譯期就會報錯，讀取來源集中可控。

## 補充

也可注入 `ConfigService` 用 `configService.get('s3.bucket', { infer: true })` 取值，效果相同。
