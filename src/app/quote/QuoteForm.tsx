"use client";

import { useActionState, useRef, useState } from "react";
import { submitQuoteRequest, type QuoteFormState } from "./actions";

const initialState: QuoteFormState = { status: "idle", message: "" };

const inputClass =
  "w-full rounded-lg border border-line bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-brass";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.pdf,.dxf";

export default function QuoteForm() {
  const [state, formAction, pending] = useActionState(submitQuoteRequest, initialState);
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-brass/40 bg-brass/5 p-10 text-center">
        <p className="font-display text-2xl font-medium">Request received ✓</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{state.message}</p>
        <a
          href="/account"
          className="mt-6 inline-block rounded-full bg-walnut px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brass"
        >
          Track it in My Account
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-7">
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
        <p className="mt-2 text-xs text-muted">
          Submitting creates a free account under your email so you can track
          your quote and project status.
        </p>
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
        {pending ? "Sending your request…" : "Submit Quote Request"}
      </button>
    </form>
  );
}
