// ============================================================================
// Database Store — Replaces Vercel KV
// ============================================================================

import { desc, eq } from "drizzle-orm";

import type { SkillConfig, SkillModuleId, VersionEntry } from "@/data/skills";
import { getSkillData } from "@/data/skills/all-skills";
import { getDb, schema } from "@/db";

// ── Public API ──────────────────────────────────────────────────────────────

export async function getSkillPrompt(moduleId: SkillModuleId): Promise<string> {
  const db = getDb();
  const result = await db
    .select({ prompt: schema.skillConfigs.prompt })
    .from(schema.skillConfigs)
    .where(eq(schema.skillConfigs.moduleId, moduleId))
    .limit(1);

  if (result.length > 0) return result[0].prompt;

  // Fallback to static data if not in DB
  const data = getSkillData(moduleId);
  return data?.config.prompt ?? "";
}

export async function setSkillPrompt(
  moduleId: SkillModuleId,
  prompt: string,
  changedByEmail?: string
): Promise<void> {
  const db = getDb();
  
  // Find user by email to get UUID
  let changedById: string | null = null;
  if (changedByEmail) {
    const userResult = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, changedByEmail))
      .limit(1);
    if (userResult.length > 0) {
      changedById = userResult[0].id;
    }
  }

  // 1. Upsert config
  const existingConfig = await db
    .select({ id: schema.skillConfigs.id })
    .from(schema.skillConfigs)
    .where(eq(schema.skillConfigs.moduleId, moduleId))
    .limit(1);

  if (existingConfig.length > 0) {
    await db
      .update(schema.skillConfigs)
      .set({
        prompt,
        updatedAt: new Date(),
        updatedBy: changedById,
      })
      .where(eq(schema.skillConfigs.moduleId, moduleId));
  } else {
    await db.insert(schema.skillConfigs).values({
      moduleId,
      prompt,
      active: true,
      updatedBy: changedById,
    });
  }

  // 2. Add to history
  const history = await getPromptHistory(moduleId);
  const nextVersion = `${history.length + 1}.0.0`;

  await db.insert(schema.promptVersions).values({
    moduleId,
    version: nextVersion,
    prompt,
    tokenCount: Math.ceil(prompt.length / 4),
    changeSummary: "Updated via Admin Panel",
    changedBy: changedById,
  });
}

export async function getPromptHistory(
  moduleId: SkillModuleId
): Promise<VersionEntry[]> {
  const db = getDb();
  const results = await db
    .select({
      id: schema.promptVersions.id,
      version: schema.promptVersions.version,
      prompt: schema.promptVersions.prompt,
      tokenCount: schema.promptVersions.tokenCount,
      changeSummary: schema.promptVersions.changeSummary,
      changedAt: schema.promptVersions.changedAt,
      // Joining users to get changedBy name could be done here, 
      // but returning raw user ID for now to match the existing interface
      changedBy: schema.promptVersions.changedBy,
    })
    .from(schema.promptVersions)
    .where(eq(schema.promptVersions.moduleId, moduleId))
    .orderBy(desc(schema.promptVersions.changedAt))
    .limit(20);

  if (results.length > 0) {
    return results.map((r) => ({
      id: r.id,
      version: r.version,
      prompt: r.prompt,
      tokenCount: r.tokenCount ?? 0,
      changeSummary: r.changeSummary ?? "",
      changedAt: r.changedAt?.toISOString() ?? new Date().toISOString(),
      changedBy: r.changedBy ?? "System",
    }));
  }

  // Fallback
  const data = getSkillData(moduleId);
  return data?.versions ?? [];
}

export async function getSkillConfig(
  moduleId: SkillModuleId
): Promise<SkillConfig | null> {
  const data = getSkillData(moduleId);
  if (!data) return null;

  const db = getDb();
  const result = await db
    .select()
    .from(schema.skillConfigs)
    .where(eq(schema.skillConfigs.moduleId, moduleId))
    .limit(1);

  if (result.length > 0) {
    const config = result[0];
    return {
      ...data.config,
      prompt: config.prompt,
      active: config.active ?? true,
      version: config.version ?? data.config.version,
      lastUpdated: config.updatedAt?.toISOString() ?? data.config.lastUpdated,
    };
  }

  return data.config;
}

export async function setSkillActive(
  moduleId: SkillModuleId,
  active: boolean
): Promise<void> {
  const db = getDb();
  
  const existingConfig = await db
    .select({ id: schema.skillConfigs.id })
    .from(schema.skillConfigs)
    .where(eq(schema.skillConfigs.moduleId, moduleId))
    .limit(1);

  if (existingConfig.length > 0) {
    await db
      .update(schema.skillConfigs)
      .set({ active })
      .where(eq(schema.skillConfigs.moduleId, moduleId));
  } else {
    // If not exists, insert with dummy prompt to enable it
    const data = getSkillData(moduleId);
    await db.insert(schema.skillConfigs).values({
      moduleId,
      prompt: data?.config.prompt ?? "",
      active,
    });
  }
}
