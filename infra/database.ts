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
      ? `file:${process.cwd()}/${$app.name}.db`
      : $interpolate`libsql://${tursoDatabase.name}-${turso.config.organization}.aws-${tursoDatabase.database.primaryRegion}.turso.io`,
    token: $dev ? "local" : tursoDatabaseToken.jwt,
  },
})

if (!$dev) {
  const databaseMigrator = new sst.aws.Function("DatabaseMigrator", {
    handler: "apps/functions/src/database/migrator.handler",
    link: [database],
    copyFiles: [
      {
        from: "migrations",
        to: "packages/core/migrations",
      },
    ],
  })

  new aws.lambda.Invocation("DatabaseMigratorInvocation", {
    input: Date.now().toString(), // This bursts caching
    functionName: databaseMigrator.name,
  })
}

new sst.x.DevCommand("DatabaseStudio", {
  dev: {
    title: "Database",
    command: "pnpm --filter core exec drizzle-kit studio",
    directory: "/", // This should be where the drizzle.config.ts is
    autostart: true,
  },
  link: [database],
})
