import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

/* ---------- Better Auth core tables ---------- */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  // custom fields
  phone: text("phone"),
  customerState: text("customer_state").notNull().default("LEAD"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

/* ---------- Application tables ---------- */

export const quoteRequest = sqliteTable("quote_request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  furnitureType: text("furniture_type").notNull(),
  roomSpace: text("room_space"),
  widthIn: real("width_in"),
  depthIn: real("depth_in"),
  heightIn: real("height_in"),
  materials: text("materials"),
  finish: text("finish"),
  budget: text("budget"),
  timeline: text("timeline"),
  description: text("description").notNull(),
  /** JSON array of Pinterest pins the customer collected: {id,title,img}[] */
  pins: text("pins"),
  status: text("status").notNull().default("LEAD"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const attachment = sqliteTable("attachment", {
  id: text("id").primaryKey(),
  quoteRequestId: text("quote_request_id")
    .notNull()
    .references(() => quoteRequest.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  storedPath: text("stored_path").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/** Audit log of every customer/project state change. */
export const statusEvent = sqliteTable("status_event", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  quoteRequestId: text("quote_request_id").references(() => quoteRequest.id, {
    onDelete: "set null",
  }),
  fromState: text("from_state"),
  toState: text("to_state").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
