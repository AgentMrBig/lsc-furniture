import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";

const MAX_FILES = 8;
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf", ".dxf"];

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

const bad = (message: string, status = 400) =>
  Response.json({ ok: false, message }, { status });

export async function POST(request: Request) {
  const formData = await request.formData();
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const name = get("name");
  const email = get("email").toLowerCase();
  const phone = get("phone");
  const furnitureType = get("furnitureType");
  const description = get("description");
  const num = (k: string) => {
    const v = parseFloat(get(k));
    return Number.isFinite(v) && v > 0 ? v : null;
  };

  if (!name || !furnitureType || !description) {
    return bad("Please give us your name, the type of piece, and a description of your idea.");
  }

  // Collected inspiration pins (validated, capped, stored as JSON).
  let pins: Array<{ id: string; title: string; img: string }> = [];
  try {
    const raw = JSON.parse(get("pins") || "[]");
    if (Array.isArray(raw)) {
      pins = raw
        .filter(
          (p) =>
            p &&
            /^\d{5,25}$/.test(String(p.id)) &&
            typeof p.img === "string" &&
            p.img.startsWith("https://i.pinimg.com/")
        )
        .slice(0, 50)
        .map((p) => ({
          id: String(p.id),
          title: String(p.title ?? "").slice(0, 120),
          img: String(p.img),
        }));
    }
  } catch {
    // ignore malformed pin payloads — pins are optional
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return bad("That email address doesn't look right.");
  }

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) {
    return bad(`Please attach at most ${MAX_FILES} files.`);
  }
  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return bad(
        `"${f.name}" isn't a supported file type. We accept photos (JPG, PNG, WEBP, HEIC), PDFs, and DXF drawings.`
      );
    }
    if (f.size > MAX_FILE_BYTES) {
      return bad(
        `"${f.name}" is over the 15 MB limit — try a smaller export or share a link in the description.`
      );
    }
  }

  try {
    const now = new Date();

    // Find or create the customer account (keyed by email). A later
    // magic-link or Google sign-in with this email lands on this account.
    let userRow = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });
    const isNewUser = !userRow;
    if (!userRow) {
      const id = randomUUID();
      await db.insert(schema.user).values({
        id,
        name,
        email,
        emailVerified: false,
        phone: phone || null,
        customerState: "LEAD",
        createdAt: now,
        updatedAt: now,
      });
      userRow = await db.query.user.findFirst({ where: eq(schema.user.id, id) });
    } else if (phone && !userRow.phone) {
      await db
        .update(schema.user)
        .set({ phone, updatedAt: now })
        .where(eq(schema.user.id, userRow.id));
    }
    if (!userRow) throw new Error("failed to create user");

    const requestId = randomUUID();
    await db.insert(schema.quoteRequest).values({
      id: requestId,
      userId: userRow.id,
      furnitureType,
      roomSpace: get("roomSpace") || null,
      widthIn: num("width"),
      depthIn: num("depth"),
      heightIn: num("height"),
      materials: get("materials") || null,
      finish: get("finish") || null,
      budget: get("budget") || null,
      timeline: get("timeline") || null,
      description,
      pins: pins.length ? JSON.stringify(pins) : null,
      status: "LEAD",
      createdAt: now,
    });

    if (files.length) {
      const dir = path.join(process.cwd(), "uploads", requestId);
      await fs.mkdir(dir, { recursive: true });
      for (const f of files) {
        const safe = sanitizeFileName(f.name);
        const stored = path.join(dir, safe);
        await fs.writeFile(stored, Buffer.from(await f.arrayBuffer()));
        await db.insert(schema.attachment).values({
          id: randomUUID(),
          quoteRequestId: requestId,
          fileName: f.name,
          storedPath: path.relative(process.cwd(), stored),
          mimeType: f.type || "application/octet-stream",
          sizeBytes: f.size,
          createdAt: now,
        });
      }
    }

    // Audit trail: record the (re-)entry into LEAD.
    await db.insert(schema.statusEvent).values({
      id: randomUUID(),
      userId: userRow.id,
      quoteRequestId: requestId,
      fromState: isNewUser ? null : userRow.customerState,
      toState: "LEAD",
      note: "Quote request submitted via website form",
      createdAt: now,
    });
    if (!isNewUser && userRow.customerState !== "LEAD") {
      // A returning customer with a new request becomes an active lead again.
      await db
        .update(schema.user)
        .set({ customerState: "LEAD", updatedAt: now })
        .where(eq(schema.user.id, userRow.id));
    }

    // Best-effort: send a magic sign-in link so they can track their request.
    // (Currently logs to the server console until an email provider is wired.)
    try {
      await auth.api.signInMagicLink({
        body: { email, callbackURL: "/account" },
        headers: new Headers(),
      });
    } catch (e) {
      console.warn("[quote] magic link send failed:", e);
    }

    return Response.json({
      ok: true,
      message: `Thanks, ${name}! Your request is in and an account has been created for ${email}. We'll reply with a quote or questions — usually within two business days.`,
    });
  } catch (err) {
    console.error("[quote] submission failed:", err);
    return bad(
      "Something went wrong saving your request. Please try again, or email us directly.",
      500
    );
  }
}
