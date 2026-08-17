import { randomUUID, randomBytes } from "crypto";

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function newToken(): string {
  return randomBytes(24).toString("hex");
}

export function nowIso(): string {
  return new Date().toISOString();
}
