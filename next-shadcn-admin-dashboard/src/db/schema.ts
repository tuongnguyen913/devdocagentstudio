// ============================================================================
// Database Schema — Drizzle ORM + Neon Postgres
// ============================================================================

import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  language: varchar("language", { length: 10 }).default("vi"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Skill Configs ─────────────────────────────────────────────────────────────
export const skillConfigs = pgTable("skill_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: varchar("module_id", { length: 50 }).unique().notNull(),
  prompt: text("prompt").notNull(),
  active: boolean("active").default(true),
  version: varchar("version", { length: 20 }).default("1.0.0"),
  schemaVersion: varchar("schema_version", { length: 20 }).default("1.0.0"),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Prompt Versions (History) ─────────────────────────────────────────────────
export const promptVersions = pgTable("prompt_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  prompt: text("prompt").notNull(),
  tokenCount: integer("token_count"),
  changeSummary: text("change_summary"),
  changedBy: uuid("changed_by").references(() => users.id),
  changedAt: timestamp("changed_at").defaultNow(),
});

// ── Generated Documents (Audit Log) ──────────────────────────────────────────
export const generatedDocuments = pgTable("generated_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  userId: uuid("user_id").references(() => users.id),
  fileName: varchar("file_name", { length: 500 }),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: integer("file_size"),
  blobUrl: text("blob_url"),
  userRequest: text("user_request"),
  formData: jsonb("form_data"),         // Form fields used
  aiUsed: boolean("ai_used").default(false), // Was AI used?
  tokensUsed: integer("tokens_used").default(0),
  status: varchar("status", { length: 20 }).default("success"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Form Templates (configurable per skill) ──────────────────────────────────
export const formTemplates = pgTable("form_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: varchar("module_id", { length: 50 }).unique().notNull(),
  fieldsJson: jsonb("fields_json").notNull(),
  version: varchar("version", { length: 20 }).default("1.0.0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Session Tokens (optional — currently using JWT cookies) ──────────────────
// (Kept for reference if you want DB-backed sessions later)

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SkillConfig = typeof skillConfigs.$inferSelect;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
