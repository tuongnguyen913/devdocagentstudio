import type { SkillModuleData, SkillModuleId } from "./index";
import { docxData } from "./docx";
import { pptxData } from "./pptx";
import { excelData } from "./excel";
import { umlData } from "./uml";
import { bugReleaseData } from "./bug-release";
import { transferData } from "./transfer";
import { featureData } from "./feature";

export const allSkillData: Record<SkillModuleId, SkillModuleData> = {
  docx: docxData,
  pptx: pptxData,
  excel: excelData,
  uml: umlData,
  "bug-release": bugReleaseData,
  transfer: transferData,
  feature: featureData,
};

export function getSkillData(moduleId: string): SkillModuleData | null {
  return allSkillData[moduleId as SkillModuleId] ?? null;
}

export function getAllSkillConfigs() {
  return Object.values(allSkillData).map((d) => d.config);
}

export function getAggregateStats() {
  const all = Object.values(allSkillData);
  return {
    totalSkills: all.length,
    activeSkills: all.filter((d) => d.config.active).length,
    totalGenerated: all.reduce((s, d) => s + d.stats.totalGenerated, 0),
    totalTokensUsed: all.reduce((s, d) => s + d.stats.totalTokensUsed, 0),
    thisMonthGenerated: all.reduce((s, d) => s + d.stats.thisMonthGenerated, 0),
    thisMonthTokens: all.reduce((s, d) => s + d.stats.thisMonthTokens, 0),
    avgSuccessRate:
      all.reduce((s, d) => s + d.stats.successRate, 0) / all.length,
  };
}
