"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { clearPins, removePin, useSelectedPins } from "@/lib/pin-selection";

// On the static GitHub Pages preview there is no server: the form composes
// an email instead of creating an account. The full deployment posts to
// /api/quote which stores the request and auto-creates the account.
const IS_STATIC = process.env.NEXT_PUBLIC_STATIC === "1";

const inputClass =
  "w-full rounded-lg border border-line bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-brass";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.pdf,.dxf";

type FormState = { status: "idle" | "success" | "error"; message: string };

function composeMailto(form: HTMLFormElement, pinUrls: string[]): string {
  const fd = new FormData(form);
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const lines = [
    "CUSTOM FURNITURE — QUOTE REQUEST",
    "================================",
    `Name:       ${get("name")}`,
    `Email:      ${get("email")}`,
    `Phone:      ${get("phone")}`,
    `Piece:      ${get("furnitureType")}`,
    `Room:       ${get("roomSpace")}`,
    `Dimensions: W ${get("width") || "?"} × D ${get("depth") || "?"} × H ${get("height") || "?"} in`,
    `Materials:  ${get("materials")}`,
    `Finish:     ${get("finish")}`,
    `Budget:     ${get("budget")}`,
    `Timeline:   ${get("timeline")}`,
    "",
    "Idea:",
    get("description"),
    ...(pinUrls.length
      ? ["", "Inspiration pins I collected:", ...pinUrls.map((u) => `- ${u}`)]
      : []),
    "",
    "(Attach your photos/sketches/drawings to this email before sending.)",
  ];
  return `mailto:${site.email}?subject=${encodeURIComponent(
    `Furniture Quote — ${get("name")}`
  )}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export default function QuoteForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });
  const [pending, setPending] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const selectedPins = useSelectedPins();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (IS_STATIC) {
      // Preview site: open the visitor's email client with everything filled in.
      window.location.href = composeMailto(
        form,
        selectedPins.map((p) => `https://www.pinterest.com/pin/${p.id}/`)
      );
      clearPins();
      setState({
        status: "success",
        message:
          "We opened a pre-filled email in your mail app — attach your photos and hit send. (On our full site this form submits directly and creates your project account.)",
      });
      return;
    }

    setPending(true);
    setState({ status: "idle", message: "" });
    try {
      const fd = new FormData(form);
      fd.set("pins", JSON.stringify(selectedPins));
      const res = await fetch("/api/quote", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        clearPins();
        setState({ status: "success", message: data.message });
      } else {
        setState({
          status: "error",
          message: data?.message ?? "Something went wrong — please try again.",
        });
      }
    } catch {
      setState({
        status: "error",
        message: "Couldn't reach the server. Check your connection and try again, or email us directly.",
      });
    } finally {
      setPending(false);
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-brass/40 bg-brass/5 p-10 text-center">
        <p className="font-display text-2xl font-medium">Request received ✓</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{state.message}</p>
        {!IS_STATIC && (
          <a
            href="/account"
            className="mt-6 inline-block rounded-full bg-walnut px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brass"
          >
            Track it in My Account
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <section>
        <h2 className="font-display text-lg font-medium">You</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Name <span className="text-brass">*</span></span>
            <input name="name" required autoComplete="name" className={inputClass} placeholder="Jane Smith" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Email <span className="text-brass">*</span></span>
            <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@example.com" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Phone</span>
            <input name="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="(555) 555-0100" />
          </label>
        </div>
        {!IS_STATIC && (
          <p className="mt-2 text-xs text-muted">
            Submitting creates a free account under your email so you can track
            your quote and project status.
          </p>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-medium">The piece</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Type of furniture <span className="text-brass">*</span></span>
            <select name="furnitureType" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select…</option>
              <option>Dining table</option>
              <option>Desk</option>
              <option>Coffee / side table</option>
              <option>Built-ins / shelving</option>
              <option>Credenza / console</option>
              <option>Bed / bedroom</option>
              <option>Bench / seating</option>
              <option>Something else entirely</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Room / where it lives</span>
            <input name="roomSpace" className={inputClass} placeholder="e.g. dining room, home office nook" />
          </label>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-sm font-medium">Approximate dimensions (inches)</span>
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">Width</span>
              <input name="width" type="number" min="0" step="0.25" className={inputClass} placeholder="72" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">Depth</span>
              <input name="depth" type="number" min="0" step="0.25" className={inputClass} placeholder="36" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">Height</span>
              <input name="height" type="number" min="0" step="0.25" className={inputClass} placeholder="30" />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Rough numbers are fine — we'll confirm exact dimensions during design.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Wood / materials in mind</span>
            <input name="materials" className={inputClass} placeholder="e.g. walnut, white oak, 'you pick'" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Finish / style</span>
            <input name="finish" className={inputClass} placeholder="e.g. natural oil, dark stain, painted" />
          </label>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium">
          Your collected ideas
          {selectedPins.length > 0 && (
            <span className="ml-2 rounded-full bg-brass/15 px-2.5 py-0.5 text-xs font-semibold text-brass">
              {selectedPins.length}
            </span>
          )}
        </h2>
        {selectedPins.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No pins collected yet — browse the{" "}
            <Link href="/ideas" className="text-brass hover:underline">
              ideas gallery
            </Link>{" "}
            and click any design you love. It'll show up here automatically.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              These come with your request so we can see the direction you want.
            </p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {selectedPins.map((p) => (
                <li key={p.id} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt={p.title || "Collected inspiration pin"}
                    className="h-24 w-24 rounded-lg border border-line object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePin(p.id)}
                    title="Remove this idea"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background opacity-0 shadow transition-opacity group-hover:opacity-100"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-medium">Your idea</h2>
        <label className="mt-3 block text-sm">
          <span className="mb-1.5 block font-medium">
            Describe what you want <span className="text-brass">*</span>
          </span>
          <textarea
            name="description"
            required
            rows={6}
            className={inputClass}
            placeholder="Tell us everything — the look you're going for, how it'll be used, details that matter (drawers? cable holes? matching an existing piece?), and links to any Pinterest pins from our boards that are close to your vision."
          />
        </label>

        <div className="mt-4">
          <span className="mb-1.5 block text-sm font-medium">Photos, sketches & drawings</span>
          <input
            ref={fileInput}
            type="file"
            name="files"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) =>
              setFileNames([...(e.target.files ?? [])].map((f) => f.name))
            }
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-line bg-surface px-4 py-8 text-center text-sm text-muted transition-colors hover:border-brass hover:text-brass"
          >
            {fileNames.length
              ? `${fileNames.length} file${fileNames.length > 1 ? "s" : ""} selected — click to change`
              : "Click to attach photos of your space, sketches, PDFs, or DXF drawings"}
            <span className="mt-1 block text-xs opacity-70">
              JPG · PNG · WEBP · HEIC · PDF · DXF — up to 8 files, 15 MB each
              {IS_STATIC ? " (attached to the email on the preview site)" : ""}
            </span>
          </button>
          {fileNames.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {fileNames.map((n) => (
                <li key={n} className="truncate">📎 {n}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium">Budget & timing</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Budget range</span>
            <select name="budget" defaultValue="" className={inputClass}>
              <option value="">Prefer not to say</option>
              <option>Under $1,000</option>
              <option>$1,000 – $2,500</option>
              <option>$2,500 – $5,000</option>
              <option>$5,000 – $10,000</option>
              <option>$10,000+</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">When do you need it?</span>
            <select name="timeline" defaultValue="" className={inputClass}>
              <option value="">Flexible</option>
              <option>ASAP</option>
              <option>1–2 months</option>
              <option>3–6 months</option>
              <option>Just exploring</option>
            </select>
          </label>
        </div>
      </section>

      {state.status === "error" && (
        <p role="alert" className="rounded-lg border border-red-700/30 bg-red-700/5 px-4 py-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-walnut px-8 py-3.5 font-medium text-background transition-colors hover:bg-brass disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Sending your request…" : IS_STATIC ? "Compose Quote Email" : "Submit Quote Request"}
      </button>
    </form>
  );
}
