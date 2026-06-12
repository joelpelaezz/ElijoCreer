type EnvMap = Record<string, string | undefined>;

function isPgUrl(value: string | null | undefined): value is string {
  return !!value && /^(postgres|postgresql):\/\//i.test(value);
}

function buildFromParts(env: EnvMap): string | null {
  const host = env.POSTGRES_HOST ?? env.PGHOST;
  const port = env.POSTGRES_PORT ?? env.PGPORT ?? "5432";
  const user = env.POSTGRES_USER ?? env.PGUSER;
  const password = env.POSTGRES_PASSWORD ?? env.PGPASSWORD;
  const database = env.POSTGRES_DATABASE ?? env.PGDATABASE;

  if (!host || !user || !database) return null;

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = password ? `:${encodeURIComponent(password)}` : "";
  return `postgresql://${encodedUser}${encodedPassword}@${host}:${port}/${database}`;
}

export function resolvePostgresConnectionString(env: EnvMap = process.env): string {
  const candidates = [
    env.POSTGRES_URL_NON_POOLING,
    env.POSTGRES_URL,
    env.DATABASE_URL,
    buildFromParts(env),
  ];

  const connectionString = candidates.find(isPgUrl);

  if (!connectionString) {
    throw new Error(
      "No se encontró una connection string válida de Postgres. Probé POSTGRES_URL_NON_POOLING, POSTGRES_URL, DATABASE_URL y variables POSTGRES_*/PG*."
    );
  }

  return connectionString;
}
