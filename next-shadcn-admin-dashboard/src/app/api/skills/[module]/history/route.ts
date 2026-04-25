// ============================================================================
// API Route: /api/skills/[module]/history — Version History
// ============================================================================

import { type NextRequest, NextResponse } from "next/server";
import type { SkillModuleId } from "@/data/skills";
import { SKILL_MODULE_IDS } from "@/data/skills";
import {
  getPromptHistory,
  setSkillPrompt,
} from "@/lib/services/kv-store";

type RouteParams = { params: Promise<{ module: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { module: moduleId } = await params;
  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    return NextResponse.json({ error: "Invalid module" }, { status: 404 });
  }
  const history = await getPromptHistory(moduleId as SkillModuleId);
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { module: moduleId } = await params;
  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    return NextResponse.json({ error: "Invalid module" }, { status: 404 });
  }

  const body = await req.json();
  const { action, versionId } = body;

  if (action === "restore" && versionId) {
    const history = await getPromptHistory(moduleId as SkillModuleId);
    const target = history.find((v) => v.id === versionId);
    if (!target) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }
    await setSkillPrompt(
      moduleId as SkillModuleId,
      target.prompt,
      "admin@devdocs.vn"
    );
    return NextResponse.json({ success: true, restoredVersion: target });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
