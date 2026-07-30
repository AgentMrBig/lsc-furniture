import type { Metadata } from "next";
import Link from "next/link";
import FurnitureArt from "@/components/FurnitureArt";

export const metadata: Metadata = {
  title: "Portfolio — Custom Furniture Projects",
  description:
    "A portfolio of custom furniture by Living Stone Creations: dining tables, desks, built-in shelving, credenzas, and one-of-a-kind commissioned pieces.",
  alternates: { canonical: "/portfolio" },
};

// TODO(owner): drop real project photos into /public/portfolio and replace
// each entry's `art` with an `img: "/portfolio/filename.jpg"` — the grid will
// use them automatically once you share the photos.
const projects = [
  { art: "table", title: "Walnut Dining Table", detail: "Seats eight · hand-rubbed oil finish" },
  { art: "desk", title: "Executive Writing Desk", detail: "White oak · cable management built in" },
  { art: "shelf", title: "Library Built-ins", detail: "Floor-to-ceiling · painted maple" },
  { art: "credenza", title: "Mid-century Credenza", detail: "Sapele · brass hardware" },
  { art: "chair", title: "Entry Bench", detail: "Ash · through-tenon joinery" },
  { art: "bed", title: "Platform Bed", detail: "Cherry · floating nightstands" },
  { art: "table", title: "Live-edge Coffee Table", detail: "Local slab · steel base" },
  { art: "shelf", title: "Mudroom Lockers", detail: "Painted poplar · five bays" },
  { art: "desk", title: "Standing Desk", detail: "Bamboo top · custom width" },
];

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="font-display text-4xl font-medium tracking-tight">Portfolio</h1>
      <p className="mt-4 max-w-2xl text-muted">
        A sample of pieces that have left the shop. Professional photos of
        recent projects are on their way — in the meantime, these sketches show
        the range of what we build.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <figure
            key={p.title}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <div className="flex h-52 items-center justify-center border-b border-line bg-background/60">
              <FurnitureArt kind={p.art} className="h-32 text-walnut/60" />
            </div>
            <figcaption className="p-5">
              <p className="font-display text-lg font-medium">{p.title}</p>
              <p className="mt-1 text-sm text-muted">{p.detail}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-line bg-surface p-10 text-center">
        <h2 className="font-display text-2xl font-medium">Want something like these?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Every piece here started as somebody's idea. Yours is next.
        </p>
        <Link
          href="/quote"
          className="mt-6 inline-block rounded-full bg-walnut px-7 py-3 font-medium text-background transition-colors hover:bg-brass"
        >
          Request a Quote
        </Link>
      </div>
    </div>
  );
}
