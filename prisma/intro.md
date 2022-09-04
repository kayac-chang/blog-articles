# Prisma

## Setup

### Dependencies

```
npm i --save-dev prisma typescript ts-node @types/node nodemon
```

### tsconfig

```json

```

### Init

```
npx prisma init --datasource-provider sqlite

...

✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.
```

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

```.env
DATABASE_URL="file:./dev.db"
```

## Schema

```prisma
modal User {
  id   Int @id @default(autoincrement())
  name String
}
```

## Migration

```
prisma migrate dev --name init

...

✔ Generated Prisma Client (4.1.0 | library) to ./node_modules/@prisma/client in 69ms
```

```
yarn add @prisma/client
```
