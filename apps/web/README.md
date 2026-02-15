# Web

The source code of the Artist Together website.

## Development

1. Copy `.env` file and fill values:

```shell
cp apps/web/.env.example apps/web/.env
```

2. Install dependencies:

```shell
bun install
```

3. Run the dev server:

```shell
bun --filter "./apps/web" dev
```

4. (Optional) Rune the `wss` app for cursor presence:

```shell
bun --filter "./apps/wss" dev
```
