"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ideas", label: "Ideas" },
  { href: "/about", label: "About" },
  { href: "/account", label: "My Account" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          Living Stone <span className="italic text-brass">Creations</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm tracking-wide transition-colors hover:text-brass ${
                pathname.startsWith(l.href) ? "text-brass" : "text-foreground/75"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="rounded-full bg-walnut px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brass"
          >
            Request a Quote
          </Link>
        </nav>

        <button
          className="p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line px-5 pb-5 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm ${
                pathname.startsWith(l.href) ? "text-brass" : "text-foreground/75"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/quote"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-walnut px-5 py-2.5 text-center text-sm font-medium text-background"
          >
            Request a Quote
          </Link>
        </nav>
      )}
    </header>
  );
}
