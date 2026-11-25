import type { PoolConfig } from "pg";

/**
 * Connection settings for node-postgres. Managed databases give a CA certificate
 * (App Platform: DATABASE_CA_CERT); with it, TLS is verified against that CA and the
 * URL's sslmode is dropped so it can't override the verified settings.
 */
export function pgConfig(url: string, ca?: string, max = 5): PoolConfig {
  if (!ca) return { connectionString: url, max };
  const parsed = new URL(url);
  parsed.searchParams.delete("sslmode");
  return { connectionString: parsed.toString(), ssl: { ca, rejectUnauthorized: true }, max };
}
