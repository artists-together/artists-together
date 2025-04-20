const tursoDatabase = $dev
  ? null
  : new turso.Database("TursoDatabase", {
      name: $interpolate`${$app.name}-${$app.stage}`,
      group: "default",
    })

const tursoDatabaseToken = $dev
  ? null
  : turso.getDatabaseTokenOutput({
      id: tursoDatabase.id,
    })

export const database = new sst.Linkable("Database", {
  properties: {
    url: $dev
      ? "file:./local.db"
      : $interpolate`libsql://${tursoDatabase.name}-${turso.config.organization}.turso.io`,
    token: $dev ? "local" : tursoDatabaseToken.jwt,
  },
})

new sst.x.DevCommand("DatabaseStudio", {
  dev: {
    title: "Database",
    command: "pnpm --filter core exec drizzle-kit studio",
    directory: "/", // This should be where the drizzle.config.ts is
    autostart: true,
  },
  link: [database],
})
