"use client";

import { useState } from "react";
import pinData from "@/data/pinterest-pins.json";
import { site } from "@/lib/site";

type Pin = { id: string; title: string; img: string; w: number; h: number };

const BOARD_META = [
  { key: "desks", label: "Desks & Tables" },
  { key: "finishes", label: "Finishes" },
] as const;

type BoardKey = (typeof BOARD_META)[number]["key"];

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
      // weave 2 desk pins per finishes pin to reflect board sizes
      const take = l.key === "desks" ? [l.pins[i * 2], l.pins[i * 2 + 1]] : [l.pins[i]];
      for (const p of take) if (p) out.push(p);
    }
    if (limit && out.length >= limit) break;
  }
  return limit ? out.slice(0, limit) : out;
}

export default function PinGrid({ limit }: { limit?: number }) {
  const [filter, setFilter] = useState<BoardKey | "all">("all");
  const pins = interleave(limit).filter((p) => filter === "all" || p.board === filter);

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
        {pins.map((p) => (
          <a
            key={`${p.board}-${p.id}`}
            href={`https://www.pinterest.com/pin/${p.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative mb-4 block overflow-hidden rounded-xl bg-surface"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pin images stay on Pinterest's CDN; natural sizes drive the masonry */}
            <img
              src={p.img}
              alt={p.title || "Furniture inspiration pin"}
              width={p.w}
              height={p.h}
              loading="lazy"
              className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {p.title && (
                <span className="line-clamp-2 text-xs font-medium text-white">{p.title}</span>
              )}
              <span className="mt-1 text-[10px] uppercase tracking-wide text-white/70">
                {BOARD_META.find((b) => b.key === p.board)?.label} · View on Pinterest
              </span>
            </span>
          </a>
        ))}
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
        {" "}— images belong to their original creators and link back to Pinterest.
      </p>
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
