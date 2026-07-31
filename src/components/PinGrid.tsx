"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import pinData from "@/data/pinterest-pins.json";
import { site } from "@/lib/site";
import {
  clearPins,
  togglePin,
  useSelectedPins,
  type SelectedPin,
} from "@/lib/pin-selection";

type Pin = { id: string; title: string; img: string; w: number; h: number };

const BOARD_META = [
  { key: "desks", label: "Desks & Tables" },
  { key: "finishes", label: "Finishes" },
] as const;

type BoardKey = (typeof BOARD_META)[number]["key"];

const MODAL_SEEN_KEY = "lsc-pin-modal-seen";

/** The header's Request a Quote button (visible on desktop only). */
function findHeaderQuoteButton(): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLAnchorElement>("header a")).find(
      (a) => /quote/.test(a.getAttribute("href") ?? "") && a.offsetParent !== null
    ) ?? null
  );
}

/** The floating collection tray (exists once at least one pin is collected). */
function findTray(): HTMLElement | null {
  return document.getElementById("pin-tray");
}

/**
 * Fly a clone of the clicked pin image along an arc down into the collection
 * tray, shrinking as it goes; the tray pops as it "catches" the pin.
 */
function flyPinToTray(imgEl: HTMLImageElement | null) {
  if (!imgEl) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Defer a beat so the tray exists when this is the first collected pin.
  window.setTimeout(() => {
    const target = findTray();
    if (!target) return;
    const from = imgEl.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width || !to.width) return;

    const clone = imgEl.cloneNode() as HTMLImageElement;
    Object.assign(clone.style, {
      position: "fixed",
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      objectFit: "cover",
      borderRadius: "12px",
      zIndex: "80",
      pointerEvents: "none",
      margin: "0",
      boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    });
    document.body.appendChild(clone);

    const endX = to.left + to.width / 2 - 16;
    const endY = to.top + to.height / 2 - 16;
    // quadratic bezier control point above the straight line = upward arc
    const ctrlX = (from.left + endX) / 2;
    const ctrlY = Math.min(from.top, endY) - 140;

    const progress = { t: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        clone.remove();
        gsap.fromTo(
          target,
          { scale: 1.18 },
          { scale: 1, duration: 0.4, ease: "back.out(3)" }
        );
      },
    });
    tl.to(
      progress,
      {
        t: 1,
        duration: 0.65,
        ease: "power2.in",
        onUpdate: () => {
          const t = progress.t;
          const mt = 1 - t;
          clone.style.left = `${mt * mt * from.left + 2 * mt * t * ctrlX + t * t * endX}px`;
          clone.style.top = `${mt * mt * from.top + 2 * mt * t * ctrlY + t * t * endY}px`;
        },
      },
      0
    )
      .to(clone, { width: 32, height: 32, duration: 0.65, ease: "power2.in" }, 0)
      .to(clone, { opacity: 0, duration: 0.18 }, 0.52);
  }, 30);
}

/** Interleave the boards so the mix feels like one feed. */
function interleave(limit?: number): Array<Pin & { board: BoardKey }> {
  const lists = BOARD_META.map((b) => ({
    key: b.key,
    pins: (pinData[b.key] as Pin[]).map((p) => ({ ...p, board: b.key })),
  }));
  const out: Array<Pin & { board: BoardKey }> = [];
  const max = Math.max(...lists.map((l) => l.pins.length));
  for (let i = 0; i < max; i++) {
    for (const l of lists) {
      const take = l.key === "desks" ? [l.pins[i * 2], l.pins[i * 2 + 1]] : [l.pins[i]];
      for (const p of take) if (p) out.push(p);
    }
    if (limit && out.length >= limit) break;
  }
  return limit ? out.slice(0, limit) : out;
}

export default function PinGrid({ limit }: { limit?: number }) {
  const [filter, setFilter] = useState<BoardKey | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [arrowMode, setArrowMode] = useState<false | "tray" | "quote">(false);
  const selected = useSelectedPins();
  const selectedIds = new Set(selected.map((p) => p.id));
  const pins = interleave(limit).filter((p) => filter === "all" || p.board === filter);

  function onPinClick(pin: Pin, imgEl: HTMLImageElement | null) {
    const added = togglePin({ id: pin.id, title: pin.title, img: pin.img });
    if (!added) return;
    flyPinToTray(imgEl);
    if (!window.localStorage.getItem(MODAL_SEEN_KEY)) {
      window.localStorage.setItem(MODAL_SEEN_KEY, "1");
      // let the flight land before the modal takes over
      window.setTimeout(() => setShowModal(true), 750);
    }
  }

  return (
    <div>
      {!limit && (
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All ({(pinData.desks as Pin[]).length + (pinData.finishes as Pin[]).length})
          </FilterChip>
          {BOARD_META.map((b) => (
            <FilterChip key={b.key} active={filter === b.key} onClick={() => setFilter(b.key)}>
              {b.label} ({(pinData[b.key] as Pin[]).length})
            </FilterChip>
          ))}
        </div>
      )}

      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {pins.map((p) => {
          const isSelected = selectedIds.has(p.id);
          return (
            <button
              key={`${p.board}-${p.id}`}
              type="button"
              onClick={(e) => onPinClick(p, e.currentTarget.querySelector("img"))}
              aria-pressed={isSelected}
              className={`group relative mb-4 block w-full overflow-hidden rounded-xl bg-surface text-left transition-all ${
                isSelected
                  ? "ring-4 ring-brass ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pin images stay on Pinterest's CDN; natural sizes drive the masonry */}
              <img
                src={p.img}
                alt={p.title || "Furniture inspiration pin"}
                width={p.w}
                height={p.h}
                loading="lazy"
                className={`w-full transition-all duration-300 group-hover:scale-[1.03] ${
                  isSelected ? "opacity-90" : ""
                }`}
              />

              {/* selected badge */}
              <span
                className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brass text-background shadow-md transition-all duration-200 ${
                  isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>

              {/* hover overlay */}
              <span className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {p.title && (
                  <span className="line-clamp-2 text-xs font-medium text-white">{p.title}</span>
                )}
                <span className="mt-1 text-[10px] uppercase tracking-wide text-white/70">
                  {isSelected ? "Click to remove from your ideas" : "Click to add to your quote"}
                </span>
              </span>

              {/* small link out to the original pin, without triggering selection */}
              <a
                href={`https://www.pinterest.com/pin/${p.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View on Pinterest"
                className="absolute left-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/75 group-hover:flex group-hover:opacity-100"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Pins curated on{" "}
        {site.pinterestBoards.map((b, i) => (
          <span key={b.url}>
            {i > 0 && " and "}
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-brass hover:underline">
              {b.title}
            </a>
          </span>
        ))}
        {" "}— images belong to their original creators. Use the ↗ on a pin to view the original.
      </p>

      {showModal && (
        <FirstPinModal
          onClose={() => {
            setShowModal(false);
            setArrowMode("tray");
          }}
        />
      )}
      {arrowMode && (
        <GuideArrow
          key={arrowMode} // remount when the mode flips so the arrow re-aims
          mode={arrowMode}
          onDone={() => setArrowMode(false)}
        />
      )}
      <SelectionTray
        selected={selected}
        onAttach={() => setArrowMode("quote")}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-walnut bg-walnut text-background"
          : "border-line text-muted hover:border-brass hover:text-brass"
      }`}
    >
      {children}
    </button>
  );
}

/** Instructional modal shown the first time a visitor collects a pin. */
function FirstPinModal({ onClose }: { onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 40, scale: 0.9, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.6)" }
      );
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md rounded-2xl border border-brass/40 bg-background p-8 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl" aria-hidden="true">
          ✨
        </div>
        <h2 id="pin-modal-title" className="font-display mt-4 text-2xl font-medium">
          Great pick!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Every idea you click gets <b className="text-foreground">added to your quote request</b>.
          Collect as many as you like — when you submit the form, we'll see
          exactly what inspires you and design your piece around it.
        </p>
        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-walnut px-7 py-3 font-medium text-background transition-colors hover:bg-brass"
        >
          Got it — keep collecting
        </button>
      </div>
    </div>
  );
}

/**
 * GSAP-animated arrow that draws itself pointing at a target, then fades out.
 * mode "tray"  — shoots DOWN at the pin collection tray (first-pin guidance)
 * mode "quote" — shoots UP at the header's Request a Quote button
 */
function GuideArrow({ mode, onDone }: { mode: "tray" | "quote"; onDone: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const target =
      mode === "quote"
        ? findHeaderQuoteButton()
        : (findTray() ?? findHeaderQuoteButton());
    const svg = svgRef.current;
    const path = pathRef.current;
    const head = headRef.current;
    if (!target || !svg || !path || !head) {
      onDone();
      return;
    }

    const r = target.getBoundingClientRect();
    const pointingUp = r.top < window.innerHeight / 2;
    // end just outside the button, start a curve away from it
    const endX = r.left + r.width / 2;
    const endY = pointingUp ? r.bottom + 14 : r.top - 14;
    const startX = Math.max(40, endX - 220);
    const startY = pointingUp ? endY + 190 : endY - 190;
    const ctrlX = startX + 30;
    const ctrlY = (startY + endY) / 2 + (pointingUp ? -60 : 60);

    path.setAttribute("d", `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`);
    const len = path.getTotalLength();
    // arrowhead angle from curve end
    const p1 = path.getPointAtLength(Math.max(0, len - 12));
    const angle = (Math.atan2(endY - p1.y, endX - p1.x) * 180) / Math.PI;
    head.setAttribute(
      "transform",
      `translate(${endX} ${endY}) rotate(${angle})`
    );

    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(head, { opacity: 0, scale: 0, transformOrigin: "center" });
    gsap.set(svg, { opacity: 1 });

    const pulse = target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.08)" },
        { transform: "scale(1)" },
      ],
      { duration: 700, iterations: 3, delay: 500 }
    );

    const tl = gsap.timeline({
      onComplete: () => {
        pulse.cancel();
        onDone();
      },
    });
    // the "quote" arrow plays quicker — it runs right before navigation
    const quick = mode === "quote";
    tl.to(path, { strokeDashoffset: 0, duration: quick ? 0.45 : 0.8, ease: "power2.inOut" })
      .to(head, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, "-=0.1")
      .to(svg, { y: pointingUp ? -8 : 8, duration: 0.35, yoyo: true, repeat: quick ? 1 : 3, ease: "sine.inOut" })
      .to(svg, { opacity: 0, duration: quick ? 0.25 : 0.5, delay: quick ? 0 : 0.6 });

    return () => {
      tl.kill();
      pulse.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-[65] h-full w-full opacity-0"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="#a07840"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        ref={headRef}
        d="M -14 -9 L 2 0 L -14 9"
        fill="none"
        stroke="#a07840"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Floating tray showing the collected ideas with a path to the quote form. */
function SelectionTray({
  selected,
  onAttach,
}: {
  selected: SelectedPin[];
  onAttach: () => void;
}) {
  const router = useRouter();
  if (selected.length === 0) return null;

  function handleAttach(e: React.MouseEvent) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Fire the up-arrow to the header quote button, then follow it there.
    if (!reduced && findHeaderQuoteButton()) {
      e.preventDefault();
      onAttach();
      window.setTimeout(() => router.push("/quote"), 1150);
    }
    // No visible header button (mobile) or reduced motion: navigate normally.
  }

  return (
    <div id="pin-tray" className="fixed bottom-5 left-1/2 z-[60] w-[min(94vw,480px)] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-brass/40 bg-background/95 py-2 pl-3 pr-2 shadow-xl backdrop-blur">
        <div className="flex -space-x-2" aria-hidden="true">
          {selected.slice(-4).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={p.img}
              alt=""
              className="h-9 w-9 rounded-full border-2 border-background object-cover"
            />
          ))}
        </div>
        <p className="flex-1 text-sm">
          <b>{selected.length}</b> idea{selected.length > 1 ? "s" : ""} collected
        </p>
        <button
          onClick={() => clearPins()}
          title="Clear collected ideas"
          className="rounded-full p-2 text-muted transition-colors hover:text-red-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <Link
          id="pin-tray-cta"
          href="/quote"
          onClick={handleAttach}
          className="rounded-full bg-walnut px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brass"
        >
          Attach to Quote →
        </Link>
      </div>
    </div>
  );
}
