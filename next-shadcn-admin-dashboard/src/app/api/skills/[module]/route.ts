// ============================================================================
// API Route: /api/skills/[module] — Skill Config CRUD
// ============================================================================

import { type NextRequest, NextResponse } from "next/server";
import type { SkillModuleId } from "@/data/skills";
import { SKILL_MODULE_IDS } from "@/data/skills";
import { getSkillData } from "@/data/skills/all-skills";
import {
  getSkillConfig,
  setSkillPrompt,
  setSkillActive,
} from "@/lib/services/kv-store";

type RouteParams = { params: Promise<{ module: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { module: moduleId } = await params;
  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    return NextResponse.json({ error: "Invalid module" }, { status: 404 });
  }
  const config = await getSkillConfig(moduleId as SkillModuleId);
  const data = getSkillData(moduleId);
  return NextResponse.json({
    config,
    stats: data?.stats ?? null,
    documents: data?.documents ?? [],
  });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { module: moduleId } = await params;
  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    return NextResponse.json({ error: "Invalid module" }, { status: 404 });
  }

  const body = await req.json();
  const { prompt, active, changedBy = "admin@devdocs.vn" } = body;

  if (prompt !== undefined) {
    await setSkillPrompt(moduleId as SkillModuleId, prompt, changedBy);
  }
  if (active !== undefined) {
    await setSkillActive(moduleId as SkillModuleId, active);
  }

  const config = await getSkillConfig(moduleId as SkillModuleId);
  return NextResponse.json({ success: true, config });
}
