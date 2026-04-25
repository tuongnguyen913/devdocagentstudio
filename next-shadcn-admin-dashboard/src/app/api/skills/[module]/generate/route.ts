// ============================================================================
// API Route: /api/skills/[module]/generate — Claude AI Streaming
// ============================================================================

import { type NextRequest } from "next/server";
import type { SkillModuleId } from "@/data/skills";
import { SKILL_MODULE_IDS } from "@/data/skills";
import { getSkillPrompt } from "@/lib/services/kv-store";
import { streamClaude } from "@/lib/services/claude-client";

type RouteParams = { params: Promise<{ module: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { module: moduleId } = await params;
  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    return new Response(JSON.stringify({ error: "Invalid module" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { userRequest } = body;

  if (!userRequest) {
    return new Response(
      JSON.stringify({ error: "userRequest is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = await getSkillPrompt(moduleId as SkillModuleId);

  // Create a streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamClaude(systemPrompt, userRequest)) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.close();
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : "Stream error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", content: errMsg })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
