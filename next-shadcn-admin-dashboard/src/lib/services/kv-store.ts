// ============================================================================
// KV Store Abstraction — Vercel KV with dummy fallback
// ============================================================================

import type { SkillConfig, SkillModuleId, VersionEntry } from "@/data/skills";
import { getSkillData } from "@/data/skills/all-skills";

// In-memory store for dummy mode
const memoryStore: Record<string, string> = {};

const isDummy = () => process.env.USE_DUMMY !== "false";

async function kvGet(key: string): Promise<string | null> {
  if (isDummy()) {
    return memoryStore[key] ?? null;
  }
  // Production: use Vercel KV
  const { kv } = await import("@vercel/kv");
  return kv.get<string>(key);
}

async function kvSet(key: string, value: string): Promise<void> {
  if (isDummy()) {
    memoryStore[key] = value;
    return;
  }
  const { kv } = await import("@vercel/kv");
  await kv.set(key, value);
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getSkillPrompt(moduleId: SkillModuleId): Promise<string> {
  const cached = await kvGet(`skill:${moduleId}:prompt`);
  if (cached) return cached;
  // Fallback to dummy data
  const data = getSkillData(moduleId);
  return data?.config.prompt ?? "";
}

export async function setSkillPrompt(
  moduleId: SkillModuleId,
  prompt: string,
  changedBy: string
): Promise<void> {
  await kvSet(`skill:${moduleId}:prompt`, prompt);

  // Save to history
  const history = await getPromptHistory(moduleId);
  const newEntry: VersionEntry = {
    id: `v-${moduleId}-${Date.now()}`,
    version: `${history.length + 1}.0.0`,
    prompt,
    changedBy,
    changedAt: new Date().toISOString(),
    changeSummary: "Updated via Admin Panel",
    tokenCount: Math.ceil(prompt.length / 4),
  };
  history.unshift(newEntry);
  await kvSet(
    `skill:${moduleId}:prompt:history`,
    JSON.stringify(history.slice(0, 20))
  );
}

export async function getPromptHistory(
  moduleId: SkillModuleId
): Promise<VersionEntry[]> {
  const cached = await kvGet(`skill:${moduleId}:prompt:history`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return [];
    }
  }
  const data = getSkillData(moduleId);
  return data?.versions ?? [];
}

export async function getSkillConfig(
  moduleId: SkillModuleId
): Promise<SkillConfig | null> {
  const data = getSkillData(moduleId);
  if (!data) return null;
  // Overlay any KV overrides
  const prompt = await getSkillPrompt(moduleId);
  return { ...data.config, prompt };
}

export async function setSkillActive(
  moduleId: SkillModuleId,
  active: boolean
): Promise<void> {
  await kvSet(`skill:${moduleId}:active`, String(active));
}
