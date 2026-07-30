"use server";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";

export type QuoteFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const MAX_FILES = 8;
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf", ".dxf"];

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

export async function submitQuoteRequest(
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const furnitureType = String(formData.get("furnitureType") ?? "").trim();
  const roomSpace = String(formData.get("roomSpace") ?? "").trim();
  const materials = String(formData.get("materials") ?? "").trim();
  const finish = String(formData.get("finish") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const timeline = String(formData.get("timeline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const num = (k: string) => {
    const v = parseFloat(String(formData.get(k) ?? ""));
    return Number.isFinite(v) && v > 0 ? v : null;
  };

  if (!name || !furnitureType || !description) {
    return {
      status: "error",
      message: "Please give us your name, the type of piece, and a description of your idea.",
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "That email address doesn't look right." };
  }

  // Validate files before touching the database.
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) {
    return { status: "error", message: `Please attach at most ${MAX_FILES} files.` };
  }
  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return {
        status: "error",
        message: `"${f.name}" isn't a supported file type. We accept photos (JPG, PNG, WEBP, HEIC), PDFs, and DXF drawings.`,
      };
    }
    if (f.size > MAX_FILE_BYTES) {
      return {
        status: "error",
        message: `"${f.name}" is over the 15 MB limit — try a smaller export or share a link in the description.`,
      };
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
      roomSpace: roomSpace || null,
      widthIn: num("width"),
      depthIn: num("depth"),
      heightIn: num("height"),
      materials: materials || null,
      finish: finish || null,
      budget: budget || null,
      timeline: timeline || null,
      description,
      status: "LEAD",
      createdAt: now,
    });

    // Store attachments under uploads/<requestId>/
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

    return {
      status: "success",
      message: `Thanks, ${name}! Your request is in and an account has been created for ${email}. We'll reply with a quote or questions — usually within two business days.`,
    };
  } catch (err) {
    console.error("[quote] submission failed:", err);
    return {
      status: "error",
      message: "Something went wrong saving your request. Please try again, or email us directly.",
    };
  }
}
