import { notFound } from "next/navigation";
import { SKILL_MODULE_IDS, type SkillModuleId } from "@/data/skills";
import { getSkillData } from "@/data/skills/all-skills";
import { SkillDetailClient } from "./_components/skill-detail-client";

interface PageProps {
  params: Promise<{ module: string }>;
}

export default async function SkillModulePage({ params }: PageProps) {
  const { module: moduleId } = await params;

  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    notFound();
  }

  const data = getSkillData(moduleId);
  if (!data) notFound();

  return <SkillDetailClient data={data} moduleId={moduleId as SkillModuleId} />;
}
