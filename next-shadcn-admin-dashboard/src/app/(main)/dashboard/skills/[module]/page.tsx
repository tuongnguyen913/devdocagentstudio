import { notFound } from "next/navigation";
import { desc, eq, and, gte } from "drizzle-orm";
import { SKILL_MODULE_IDS, type SkillModuleId, type GeneratedDocument, type UsageStats } from "@/data/skills";
import { getSkillData } from "@/data/skills/all-skills";
import { getDb, schema } from "@/db";
import { getPromptHistory, getSkillConfig } from "@/lib/services/kv-store";
import { SkillDetailClient } from "./_components/skill-detail-client";

interface PageProps {
  params: Promise<{ module: string }>;
}

export default async function SkillModulePage({ params }: PageProps) {
  const { module: moduleId } = await params;

  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    notFound();
  }

  const baseData = getSkillData(moduleId);
  if (!baseData) notFound();

  // 1. Fetch Config & History from DB
  const [config, versions] = await Promise.all([
    getSkillConfig(moduleId as SkillModuleId),
    getPromptHistory(moduleId as SkillModuleId),
  ]);

  if (!config) notFound();

  // 2. Fetch Documents from DB
  const db = getDb();
  const dbDocs = await db
    .select()
    .from(schema.generatedDocuments)
    .where(eq(schema.generatedDocuments.moduleId, moduleId))
    .orderBy(desc(schema.generatedDocuments.createdAt));

  // 3. Process Documents
  const documents: GeneratedDocument[] = dbDocs.slice(0, 10).map((d) => ({
    id: d.id,
    skillId: moduleId as SkillModuleId,
    fileName: d.fileName ?? "Tài liệu chưa đặt tên",
    fileType: d.fileType ?? "unknown",
    fileSize: d.fileSize ?? 0,
    downloadUrl: d.blobUrl ?? "#",
    userRequest: d.userRequest ?? "Tạo từ form",
    generatedAt: d.createdAt?.toISOString() ?? new Date().toISOString(),
    tokensUsed: d.tokensUsed ?? 0,
    status: (d.status as "success" | "error" | "pending") || "success",
  }));

  // 4. Calculate Stats
  const totalGenerated = dbDocs.length;
  const totalTokensUsed = dbDocs.reduce((sum, d) => sum + (d.tokensUsed ?? 0), 0);
  const successCount = dbDocs.filter((d) => d.status === "success").length;
  const successRate = totalGenerated > 0 ? Math.round((successCount / totalGenerated) * 100) : 100;
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthDocs = dbDocs.filter((d) => d.createdAt && d.createdAt >= firstDayOfMonth);
  const thisMonthGenerated = thisMonthDocs.length;
  const thisMonthTokens = thisMonthDocs.reduce((sum, d) => sum + (d.tokensUsed ?? 0), 0);

  // Calculate daily usage for last 7 days
  const dailyUsage = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);

    const dayDocs = dbDocs.filter(doc => doc.createdAt && doc.createdAt >= d && doc.createdAt < nextDay);
    dailyUsage.push({
      date: d.toISOString().split("T")[0],
      count: dayDocs.length,
      tokens: dayDocs.reduce((sum, doc) => sum + (doc.tokensUsed ?? 0), 0),
    });
  }

  const stats: UsageStats = {
    totalGenerated,
    totalTokensUsed,
    thisMonthGenerated,
    thisMonthTokens,
    avgTokensPerRequest: totalGenerated > 0 ? Math.round(totalTokensUsed / totalGenerated) : 0,
    successRate,
    dailyUsage,
  };

  const data = {
    ...baseData,
    config,
    versions,
    documents,
    stats,
  };

  return <SkillDetailClient data={data} moduleId={moduleId as SkillModuleId} />;
}
