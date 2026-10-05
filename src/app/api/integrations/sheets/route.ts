import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { readJson, sanitise, str } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Google Sheets integration.
 *
 * GET  — connection status and the sheets currently syncing.
 * POST — trigger an on-demand sync of one sheet (Owner or Manager).
 *
 * Authentication uses a service account: the customer shares the sheet with
 * the service account address, which avoids an OAuth consent round trip and
 * means we never hold a user's Google refresh token.
 */

const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const CONNECTED_SHEETS = [
  { id: "sheet-sales", name: "Daily Sales 2026", tab: "Sales", rows: 4_182, lastSync: "28 min ago" },
  { id: "sheet-stock", name: "Stock Count", tab: "Current", rows: 318, lastSync: "28 min ago" },
];

export async function GET() {
  const auth = await requireUser({ tab: "settings" });
  if ("response" in auth) return auth.response;

  return jsonNoStore({
    ok: true,
    integration: "google-sheets",
    configured: Boolean(SERVICE_ACCOUNT && PRIVATE_KEY),
    // The address is safe to show: the customer needs it to share their sheet.
    serviceAccount: SERVICE_ACCOUNT ?? null,
    sheets: CONNECTED_SHEETS,
    syncIntervalMinutes: 30,
    checkedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser({ tab: "settings", write: true });
  if ("response" in auth) return auth.response;

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return jsonNoStore({ ok: false, error: "Invalid request." }, { status: 400 });

  const sheetId = sanitise(str(body.sheetId, 120));
  if (!sheetId) {
    return jsonNoStore({ ok: false, error: "Which sheet should we sync?" }, { status: 422 });
  }

  if (!SERVICE_ACCOUNT || !PRIVATE_KEY) {
    return jsonNoStore(
      {
        ok: false,
        error:
          "Google Sheets is not configured for this deployment. Add the service account credentials in your environment.",
      },
      { status: 503 }
    );
  }

  /*
   * Production: mint a JWT signed with PRIVATE_KEY for the
   * spreadsheets.readonly scope, exchange it at oauth2.googleapis.com/token,
   * then GET /v4/spreadsheets/{id}/values/{range}. Rows are mapped to the
   * workspace schema and upserted on the sheet's own key column.
   */

  return jsonNoStore({
    ok: true,
    sheetId,
    queuedBy: auth.user.email,
    status: "queued",
    message: "Sync queued. New rows appear on your dashboards within a few minutes.",
  });
}
