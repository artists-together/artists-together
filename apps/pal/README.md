# Pal

The source code of Pal (Programmable Artistic Life-form), the assistant bot for the Artist Together community.

## Getting Started

1. Copy `.env` file and fill values:

```shell
cp apps/pal/.env.example apps/pal/.env
```

2. Install dependencies:

```shell
bun install
```

3. Run database migrations:

```shell
bun --filter "./apps/pal" db:migrate
```

4. Run in development mode:

```shell
bun --filter "./apps/pal" dev
```
