import type { Metadata } from "next";
import Link from "next/link";
import PinterestBoards from "@/components/PinterestBoards";

export const metadata: Metadata = {
  title: "Furniture Ideas & Inspiration",
  description:
    "Browse curated Pinterest boards of custom furniture designs and finishes — desks, tables, and finish inspiration for your commissioned piece.",
  alternates: { canonical: "/ideas" },
};

export default function IdeasPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight">
        Need some furniture ideas?
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        These are the boards we keep of designs, details, and finishes we love.
        Scroll through, save what speaks to you, and drop the links into your
        quote request — it's the fastest way to show us the direction you want.
      </p>

      <div className="mt-12">
        <PinterestBoards />
      </div>

      <div className="mt-16 rounded-xl border border-line bg-surface p-10 text-center">
        <h2 className="font-display text-2xl font-medium">Found your direction?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Bring those pins to the quote form and tell us about your space.
        </p>
        <Link
          href="/quote"
          className="mt-6 inline-block rounded-full bg-walnut px-7 py-3 font-medium text-background transition-colors hover:bg-brass"
        >
          Start Your Quote
        </Link>
      </div>
    </div>
  );
}
