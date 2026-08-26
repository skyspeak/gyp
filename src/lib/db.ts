import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

// Names the database a CLI run is about to write to. An empty
// TURSO_DATABASE_URL silently falls back to the local file and still prints
// "Seeded 381 programs", which is indistinguishable from a successful
// production seed — that has already caused one reseed to be believed done
// when it had not happened.
export function describeTarget(): string {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return "LOCAL FILE ./local.db  (TURSO_DATABASE_URL is not set)";
  if (url.startsWith("file:")) return `LOCAL FILE ${url}`;
  try {
    return `REMOTE ${new URL(url).hostname}`;
  } catch {
    return `REMOTE ${url}`;
  }
}

export function db(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

  // The file: fallback exists so `npm run dev` works with zero setup. On a
  // real deployment it is a trap: libSQL happily CREATES an empty ./local.db
  // instead of failing, and every query then dies with "no such table" far
  // from the actual cause. Fail loudly where a real database is required.
  if (!url) {
    if (process.env.VERCEL) {
      throw new Error(
        "TURSO_DATABASE_URL is not set. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the Vercel project's environment variables — the local file fallback is for development only."
      );
    }
    client = createClient({ url: "file:./local.db" });
    return client;
  }

  client = createClient(url.startsWith("file:") ? { url } : { url, authToken });
  return client;
}
