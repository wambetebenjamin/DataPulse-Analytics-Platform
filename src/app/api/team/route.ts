import { requireUser } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api";
import { isEmail, readJson, sanitise, str } from "@/lib/validation";
import { ROLE_CAPABILITIES, team, type Role } from "@/data/analytics";
import { TEAM_EMAIL, acknowledgementTemplate, sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES: Role[] = ["Owner", "Manager", "Analyst", "Viewer"];

/** List workspace members. Any signed-in member may read it. */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  return jsonNoStore({
    ok: true,
    team,
    capabilities: ROLE_CAPABILITIES,
    you: { email: auth.user.email, role: auth.user.role },
  });
}

/** Invite a member. Owner only. */
export async function POST(request: Request) {
  const auth = await requireUser({ admin: true });
  if ("response" in auth) return auth.response;

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return jsonNoStore({ ok: false, error: "Invalid request." }, { status: 400 });

  const name = sanitise(str(body.name, 120));
  const email = str(body.email, 254).toLowerCase();
  const role = sanitise(str(body.role, 20)) as Role;

  if (!isEmail(email)) {
    return jsonNoStore({ ok: false, error: "Enter a valid email address." }, { status: 422 });
  }
  if (!ROLES.includes(role)) {
    return jsonNoStore({ ok: false, error: "Choose a valid role." }, { status: 422 });
  }
  if (team.some((m) => m.email.toLowerCase() === email)) {
    return jsonNoStore(
      { ok: false, error: "That person is already in this workspace." },
      { status: 409 }
    );
  }

  await sendMail({
    to: email,
    subject: `${auth.user.name} invited you to a DataPulse workspace`,
    ...acknowledgementTemplate(
      name,
      `${auth.user.name} has invited you to join the ${auth.user.organisation} workspace on DataPulse Analytics as a ${role}. Sign in with this email address to accept.`
    ),
  });
  await sendMail({
    to: TEAM_EMAIL,
    subject: `[Team] ${auth.user.organisation} invited ${email} as ${role}`,
    text: `Invited by ${auth.user.email}`,
    html: `<p>Invited by ${auth.user.email}</p>`,
  });

  return jsonNoStore({
    ok: true,
    member: {
      id: `U-${Date.now().toString(36).toUpperCase()}`,
      name: name || email,
      email,
      role,
      status: "Invited",
      lastActive: "—",
    },
  });
}

/** Change a member's role. Owner only. The last Owner cannot be demoted. */
export async function PATCH(request: Request) {
  const auth = await requireUser({ admin: true });
  if ("response" in auth) return auth.response;

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return jsonNoStore({ ok: false, error: "Invalid request." }, { status: 400 });

  const email = str(body.email, 254).toLowerCase();
  const role = sanitise(str(body.role, 20)) as Role;
  if (!ROLES.includes(role)) {
    return jsonNoStore({ ok: false, error: "Choose a valid role." }, { status: 422 });
  }

  const owners = team.filter((m) => m.role === "Owner");
  if (owners.length === 1 && owners[0]!.email.toLowerCase() === email && role !== "Owner") {
    return jsonNoStore(
      { ok: false, error: "Promote another Owner before changing this one." },
      { status: 409 }
    );
  }

  return jsonNoStore({ ok: true, email, role });
}
