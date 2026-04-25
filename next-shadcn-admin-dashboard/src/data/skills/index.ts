// ============================================================================
// DevDocs Studio — Skill Module Types & Shared Interfaces
// ============================================================================

export type SkillModuleId =
  | "docx"
  | "pptx"
  | "excel"
  | "uml"
  | "bug-release"
  | "transfer"
  | "feature";

export interface SkillConfig {
  id: SkillModuleId;
  name: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
  version: string;
  prompt: string;
  kvPrefix: string;
  apiRoute: string;
  templateUrl?: string;
  schemaVersion: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface VersionEntry {
  id: string;
  version: string;
  prompt: string;
  changedBy: string;
  changedAt: string;
  changeSummary: string;
  tokenCount: number;
}

export interface GeneratedDocument {
  id: string;
  skillId: SkillModuleId;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  userRequest: string;
  generatedAt: string;
  tokensUsed: number;
  status: "success" | "error" | "pending";
}

export interface UsageStats {
  totalGenerated: number;
  totalTokensUsed: number;
  thisMonthGenerated: number;
  thisMonthTokens: number;
  avgTokensPerRequest: number;
  successRate: number;
  dailyUsage: { date: string; count: number; tokens: number }[];
}

export interface SkillModuleData {
  config: SkillConfig;
  versions: VersionEntry[];
  documents: GeneratedDocument[];
  stats: UsageStats;
}

// Module metadata for navigation and display
export const SKILL_MODULES: Record<
  SkillModuleId,
  { name: string; description: string; icon: string; color: string; fileTypes: string[] }
> = {
  docx: {
    name: "DOCX",
    description: "Tài liệu hướng dẫn & công văn nhà nước",
    icon: "FileText",
    color: "#2B579A",
    fileTypes: [".docx"],
  },
  pptx: {
    name: "PPTX",
    description: "Slide demo phần mềm cho khách hàng",
    icon: "Presentation",
    color: "#D24726",
    fileTypes: [".pptx"],
  },
  excel: {
    name: "Excel",
    description: "Bảng báo giá & tracking tính năng",
    icon: "Sheet",
    color: "#217346",
    fileTypes: [".xlsx"],
  },
  uml: {
    name: "UML Diagrams",
    description: "Use case, Class, Sequence diagram",
    icon: "GitBranch",
    color: "#6366F1",
    fileTypes: [".svg", ".png"],
  },
  "bug-release": {
    name: "Bug & Release",
    description: "Theo dõi lỗi & release notes",
    icon: "Bug",
    color: "#EF4444",
    fileTypes: [".md", ".docx"],
  },
  transfer: {
    name: "Transfer KN",
    description: "Tài liệu bàn giao nội bộ kỹ thuật",
    icon: "ArrowRightLeft",
    color: "#F59E0B",
    fileTypes: [".docx", ".md"],
  },
  feature: {
    name: "Feature Track",
    description: "Roadmap & theo dõi tiến độ tính năng",
    icon: "Zap",
    color: "#8B5CF6",
    fileTypes: [".xlsx", ".md"],
  },
};

export const SKILL_MODULE_IDS = Object.keys(SKILL_MODULES) as SkillModuleId[];
