import { notFound } from "next/navigation";

import type { SkillModuleId } from "@/data/skills";
import { SKILL_MODULE_IDS } from "@/data/skills";
import { getSkillData } from "@/data/skills/all-skills";
import { formSchemas } from "@/data/skills/form-schemas";
import { GenerateClient } from "./_components/generate-client";

interface PageProps {
  params: Promise<{ module: string }>;
}

export default async function GeneratePage({ params }: PageProps) {
  const { module: moduleId } = await params;

  if (!SKILL_MODULE_IDS.includes(moduleId as SkillModuleId)) {
    notFound();
  }

  const data = getSkillData(moduleId);
  if (!data) notFound();

  const schema = formSchemas[moduleId] ?? [];

  return (
    <GenerateClient
      moduleId={moduleId as SkillModuleId}
      moduleName={data.config.name}
      moduleColor={data.config.color}
      formSchema={schema}
    />
  );
}
