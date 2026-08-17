import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function db(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

  client = createClient(
    url.startsWith("file:") ? { url } : { url, authToken }
  );
  return client;
}
