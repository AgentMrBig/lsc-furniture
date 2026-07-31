import Link from "next/link";
import FurnitureArt from "@/components/FurnitureArt";
import PinGrid from "@/components/PinGrid";
import pinData from "@/data/pinterest-pins.json";

const featured = [
  { kind: "table", title: "Dining Tables", desc: "Solid-wood tables sized to your room and your gatherings." },
  { kind: "desk", title: "Desks & Offices", desc: "Work surfaces built around how you actually work." },
  { kind: "shelf", title: "Built-ins & Shelving", desc: "Wall-to-wall storage that looks like it grew there." },
  { kind: "credenza", title: "Credenzas & Consoles", desc: "Statement storage for dining rooms and entryways." },
  { kind: "chair", title: "Seating", desc: "Benches, stools, and chairs built to be used daily." },
  { kind: "bed", title: "Bedroom", desc: "Beds and nightstands made for a lifetime of mornings." },
];

const process = [
  { n: "01", title: "Share your idea", desc: "Tell us what you need, the space it lives in, and the style you love — collected pins, sketches, and photos all welcome." },
  { n: "02", title: "Preliminary quote", desc: "We review your request and send a preliminary quote, so you know the ballpark before anything else happens." },
  { n: "03", title: "See your design", desc: "Like the number? We draft your piece digitally — precise AutoCAD drawings, plus a 3D model when the design deserves it — and you approve it before we build." },
  { n: "04", title: "Deposit & contract", desc: "Once you approve the design, a 50% deposit and our standard agreement lock in your build slot. Everything in writing, no surprises." },
  { n: "05", title: "Built & delivered", desc: "Real joinery, premium materials, finished to last — then delivered and placed in your home." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[3fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brass">
              Custom furniture, made to order
            </p>
            <h1 className="font-display mt-5 text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
              Furniture built for <em className="italic text-walnut">your</em> life,
              not a showroom floor.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              We design and build one-of-a-kind pieces — dining tables, desks,
              built-ins, and more — shaped to your space, your style, and the
              way you live. Solid materials. Honest joinery. No flat-pack anything.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/quote"
                className="rounded-full bg-walnut px-7 py-3.5 font-medium text-background transition-colors hover:bg-brass"
              >
                Start Your Piece
              </Link>
              <Link
                href="/portfolio"
                className="rounded-full border border-walnut/30 px-7 py-3.5 font-medium transition-colors hover:border-brass hover:text-brass"
              >
                See Our Work
              </Link>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <FurnitureArt kind="table" className="w-72 text-walnut/70" />
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="what-we-build">
        <h2 id="what-we-build" className="font-display text-3xl font-medium tracking-tight">
          What we build
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          If you can sketch it on a napkin, we can build it in hardwood.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((f) => (
            <Link
              key={f.title}
              href="/portfolio"
              className="group rounded-xl border border-line bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-brass/50 hover:shadow-sm"
            >
              <FurnitureArt kind={f.kind} className="h-24 text-walnut/60 transition-colors group-hover:text-brass" />
              <h3 className="font-display mt-5 text-xl font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Ideas — Pinterest boards */}
      <section className="border-y border-line bg-surface/60" aria-labelledby="ideas">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 id="ideas" className="font-display text-3xl font-medium tracking-tight">
            Need some furniture ideas?
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Browse the boards we keep of designs and finishes we love. See
            something close to your vision? Mention it in your quote request and
            we'll build from there.
          </p>
          <div className="mt-10">
            <PinGrid limit={12} />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/ideas"
              className="inline-block rounded-full border border-walnut/30 px-7 py-3 font-medium transition-colors hover:border-brass hover:text-brass"
            >
              Browse All {pinData.desks.length + pinData.finishes.length} Ideas
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="process">
        <h2 id="process" className="font-display text-3xl font-medium tracking-tight">
          From idea to heirloom
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {process.map((s) => (
            <div key={s.n}>
              <span className="font-display text-4xl font-light text-brass/50">{s.n}</span>
              <h3 className="mt-3 font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-walnut text-background">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Have a piece in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-background/80">
            Tell us about it — dimensions, materials, budget, and your ideas.
            Upload sketches or photos, and we'll come back with a design and a
            quote.
          </p>
          <Link
            href="/quote"
            className="mt-9 inline-block rounded-full bg-background px-8 py-3.5 font-medium text-walnut transition-opacity hover:opacity-90"
          >
            Request a Quote
          </Link>
        </div>
      </section>
    </>
  );
}
