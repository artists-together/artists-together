const web = $dev
  ? null
  : new vercel.Project("VercelProject", {
      name: $app.name,
      framework: "nextjs",
      rootDirectory: "packages/web",
    })

const webDeployment = $dev
  ? null
  : new vercel.Deployment("VercelProjectDeployment", {
      projectId: web.id,
      production: $app.stage === "production",
      pathPrefix: process.cwd(),
      files: vercel.getProjectDirectoryOutput({
        path: process.cwd(),
      }).files,
    })
