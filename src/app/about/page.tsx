import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Shop",
  description:
    "Furniture by Living Stone Creations is a custom furniture shop building handmade tables, desks, built-ins, and commissioned pieces with honest materials and real joinery.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight">About the Shop</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5 leading-relaxed text-muted">
          {/* TODO(owner): replace with the real shop story */}
          <p>
            Furniture by Living Stone Creations is the furniture workshop of
            Living Stone Creations. We build custom pieces one at a time — no
            production lines, no shortcuts — for people who want furniture made
            for their space instead of squeezed into it.
          </p>
          <p>
            Every commission starts with a conversation about how you live: the
            room, the light, the people around the table. From there we design
            together, agree on a clear quote, and build with materials chosen to
            last — solid hardwoods, quality hardware, finishes that age
            gracefully.
          </p>
          <p>
            Our promise is simple: when your piece arrives, it fits — the
            space, the style, and the years ahead of it.
          </p>

          <h2 className="font-display pt-4 text-2xl font-medium text-foreground">
            How we work
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Designed with you — you approve the design before we cut a board",
              "Clear quotes — price and timeline agreed up front",
              "Progress updates — follow your piece from deposit to delivery in your account",
              "Built to last — real joinery and materials that earn heirloom status",
            ].map((item) => (
              <li key={item} className="rounded-lg border border-line bg-surface p-4 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-medium">Contact</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Phone</dt>
              <dd>
                <a className="text-brass hover:underline" href={`tel:${site.phone.replace(/\D/g, "")}`}>
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>
                <a className="text-brass hover:underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Shop</dt>
              <dd>
                {site.address.street}, {site.address.city}, {site.address.region}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Hours</dt>
              <dd>{site.hours}</dd>
            </div>
          </dl>
          <Link
            href="/quote"
            className="mt-6 block rounded-full bg-walnut px-5 py-2.5 text-center font-medium text-background transition-colors hover:bg-brass"
          >
            Request a Quote
          </Link>
        </aside>
      </div>
    </div>
  );
}
