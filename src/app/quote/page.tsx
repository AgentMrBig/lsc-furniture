import type { Metadata } from "next";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = {
  title: "Request a Custom Furniture Quote",
  description:
    "Request a quote for custom furniture — describe your piece, share dimensions and inspiration, upload photos or drawings, and track your project from quote to delivery.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight">
        Let's build your piece.
      </h1>
      <p className="mt-4 text-muted">
        Tell us what you're dreaming up. Only three fields are required — but
        the more you share (dimensions, materials, photos of the space,
        Pinterest pins), the faster and more accurate your quote.
      </p>
      <div className="mt-10 rounded-2xl border border-line bg-surface/60 p-6 sm:p-9">
        <QuoteForm />
      </div>
    </div>
  );
}
