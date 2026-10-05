import { NextResponse } from "next/server";

/**
 * Shared response helpers for the dashboard API.
 *
 * Dashboard data must never be cached by a CDN or the browser: it is
 * per-workspace, per-role and frequently changing. Every JSON payload leaves
 * here with explicit no-store headers.
 */

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
} as const;

export function jsonNoStore(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...NO_STORE_HEADERS, ...(init.headers ?? {}) },
  });
}

/** Parse ?range= into a safe RangeKey, defaulting to 30 days. */
export function readRange(request: Request): "7d" | "30d" | "90d" | "custom" {
  const value = new URL(request.url).searchParams.get("range");
  return value === "7d" || value === "90d" || value === "custom" ? value : "30d";
}
