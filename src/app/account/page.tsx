import type { Metadata } from "next";
import { headers } from "next/headers";
import { desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import {
  HAPPY_PATH,
  STATE_DESCRIPTIONS,
  STATE_LABELS,
  isCustomerState,
  type CustomerState,
} from "@/lib/customer-state";
import SignIn from "./SignIn";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "My Account",
  description: "Track your custom furniture quote and project status.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20">
        <h1 className="font-display text-4xl font-medium tracking-tight">My Account</h1>
        <p className="mt-3 text-muted">
          Track your quote requests and project status.
        </p>
        <div className="mt-8">
          <SignIn />
        </div>
      </div>
    );
  }

  const userRow = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });
  const state: CustomerState =
    userRow && isCustomerState(userRow.customerState) ? userRow.customerState : "LEAD";

  const requests = await db.query.quoteRequest.findMany({
    where: eq(schema.quoteRequest.userId, session.user.id),
    orderBy: [desc(schema.quoteRequest.createdAt)],
  });
  const attachments = requests.length
    ? await db.query.attachment.findMany({
        where: inArray(
          schema.attachment.quoteRequestId,
          requests.map((r) => r.id)
        ),
      })
    : [];

  const happyIndex = HAPPY_PATH.indexOf(state);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">
            Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-muted">{session.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Status */}
      <section className="mt-10 rounded-2xl border border-line bg-surface/60 p-7">
        <h2 className="font-display text-xl font-medium">Project status</h2>
        <p className="mt-1 text-sm text-muted">{STATE_DESCRIPTIONS[state]}</p>

        {happyIndex >= 0 ? (
          <ol className="mt-6 grid gap-2 sm:grid-cols-7">
            {HAPPY_PATH.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i < happyIndex
                      ? "bg-brass/25 text-brass"
                      : i === happyIndex
                        ? "bg-walnut text-background"
                        : "border border-line text-muted"
                  }`}
                >
                  {i < happyIndex ? "✓" : i + 1}
                </span>
                <span className={`text-[11px] leading-tight ${i === happyIndex ? "font-semibold" : "text-muted"}`}>
                  {STATE_LABELS[s].replace("Customer (", "").replace(")", "")}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-lg border border-line bg-background px-4 py-3 text-sm text-muted">
            Current status: <b>{STATE_LABELS[state]}</b>
          </p>
        )}
      </section>

      {/* Requests */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Your quote requests</h2>
        {requests.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface p-6 text-sm text-muted">
            No requests yet —{" "}
            <a href="/quote" className="text-brass hover:underline">start your first piece</a>.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {requests.map((r) => {
              const files = attachments.filter((a) => a.quoteRequestId === r.id);
              return (
                <li key={r.id} className="rounded-xl border border-line bg-surface p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg font-medium">{r.furnitureType}</p>
                    <p className="text-xs text-muted">
                      {r.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
                    {r.widthIn || r.depthIn || r.heightIn ? (
                      <div className="flex gap-2">
                        <dt className="text-muted">Dimensions:</dt>
                        <dd>{r.widthIn ?? "?"}″ W × {r.depthIn ?? "?"}″ D × {r.heightIn ?? "?"}″ H</dd>
                      </div>
                    ) : null}
                    {r.materials && (
                      <div className="flex gap-2"><dt className="text-muted">Materials:</dt><dd>{r.materials}</dd></div>
                    )}
                    {r.finish && (
                      <div className="flex gap-2"><dt className="text-muted">Finish:</dt><dd>{r.finish}</dd></div>
                    )}
                    {r.budget && (
                      <div className="flex gap-2"><dt className="text-muted">Budget:</dt><dd>{r.budget}</dd></div>
                    )}
                    {r.timeline && (
                      <div className="flex gap-2"><dt className="text-muted">Timeline:</dt><dd>{r.timeline}</dd></div>
                    )}
                  </dl>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{r.description}</p>
                  {files.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                      {files.map((f) => (
                        <li key={f.id} className="rounded-full border border-line bg-background px-3 py-1 text-muted">
                          📎 {f.fileName} · {(f.sizeBytes / 1024 / 1024).toFixed(1)} MB
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
