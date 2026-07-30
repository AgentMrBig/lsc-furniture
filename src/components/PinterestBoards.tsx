"use client";

import Script from "next/script";
import { useEffect } from "react";
import { site } from "@/lib/site";

declare global {
  interface Window {
    parsePinBtns?: () => void;
  }
}

/**
 * "Need some furniture ideas?" — official Pinterest board embeds, mixed
 * side by side. Images stay hosted on Pinterest with attribution and
 * link back to the boards.
 */
export default function PinterestBoards() {
  useEffect(() => {
    // Re-parse when navigating back to a page with embeds (pinit.js only
    // auto-scans on first load).
    window.parsePinBtns?.();
  }, []);

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        {site.pinterestBoards.map((b) => (
          <figure key={b.url} className="rounded-xl border border-line bg-surface p-5">
            <figcaption className="mb-3 flex items-baseline justify-between">
              <span className="font-display text-lg font-medium">{b.title}</span>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brass hover:underline"
              >
                View board →
              </a>
            </figcaption>
            <a
              data-pin-do="embedBoard"
              data-pin-board-width="540"
              data-pin-scale-height="360"
              data-pin-scale-width="90"
              href={b.url}
            />
          </figure>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Boards embedded from Pinterest — images belong to their original creators.
        Save the pins you love and mention them in your quote request.
      </p>
      <Script
        src="https://assets.pinterest.com/js/pinit.js"
        strategy="afterInteractive"
        data-pin-build="parsePinBtns"
      />
    </div>
  );
}
