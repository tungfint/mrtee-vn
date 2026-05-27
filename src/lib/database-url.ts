export function mariaDbAdapterConfig(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Example: mysql://user:password@host:3306/database");
  }

  const url = new URL(databaseUrl);

  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error("DATABASE_URL must use mysql:// or mariadb:// for the MySQL build.");
  }

  return {
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    host: url.hostname,
    password: decodeURIComponent(url.password),
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
  };
}
