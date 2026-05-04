# 前後端 API 介面

## Package Exports

`package.json` 以 wildcard subpath pattern 直接暴露 `.ts` source（無 dist）。`./src/{module}/*.ts` 下每個檔案自動成為一個 export entry

## Import 規則

`packages/api-schemas/src` 內部**只能用相對路徑，禁用 `@/` alias**
