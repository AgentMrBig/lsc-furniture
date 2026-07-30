import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">
            Living Stone <span className="italic text-brass">Creations</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline}. Every piece designed with you, built by hand, and
            made to last generations.
          </p>
        </div>
        <nav className="text-sm" aria-label="Footer">
          <p className="mb-3 font-medium tracking-wide">Explore</p>
          <ul className="space-y-2 text-muted">
            <li><Link className="hover:text-brass" href="/portfolio">Portfolio</Link></li>
            <li><Link className="hover:text-brass" href="/ideas">Furniture Ideas</Link></li>
            <li><Link className="hover:text-brass" href="/about">About the Shop</Link></li>
            <li><Link className="hover:text-brass" href="/quote">Request a Quote</Link></li>
            <li><Link className="hover:text-brass" href="/account">My Account</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="mb-3 font-medium tracking-wide">Contact</p>
          <ul className="space-y-2 text-muted">
            <li>
              <a className="hover:text-brass" href={`tel:${site.phone.replace(/\D/g, "")}`}>{site.phone}</a>
            </li>
            <li>
              <a className="hover:text-brass" href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>{site.address.street}, {site.address.city}, {site.address.region}</li>
            <li>{site.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
