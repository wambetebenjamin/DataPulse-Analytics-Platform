import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { readJson, sanitise, str } from "@/lib/validation";
import { alertHistory, alertRules, alerts } from "@/data/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser({ tab: "alerts" });
  if ("response" in auth) return auth.response;

  return jsonNoStore({
    ok: true,
    alerts,
    rules: alertRules,
    history: alertHistory,
    generatedAt: new Date().toISOString(),
  });
}

/** Create an alert rule. Owner and Manager only. */
export async function POST(request: Request) {
  const auth = await requireUser({ tab: "alerts", write: true });
  if ("response" in auth) return auth.response;

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return jsonNoStore({ ok: false, error: "Invalid request." }, { status: 400 });

  const name = sanitise(str(body.name, 120));
  const condition = sanitise(str(body.condition, 240));
  const channel = sanitise(str(body.channel, 60)) || "In-app";

  if (name.length < 2 || condition.length < 4) {
    return jsonNoStore(
      { ok: false, error: "A rule needs a name and a condition." },
      { status: 422 }
    );
  }

  // Persisted to the workspace store in production; echoed back here so the
  // optimistic UI has a server-shaped object to work with.
  return jsonNoStore({
    ok: true,
    rule: {
      id: `RULE-${Date.now().toString(36).toUpperCase()}`,
      name,
      condition,
      channel,
      active: true,
      triggered: 0,
      createdBy: auth.user.email,
    },
  });
}
