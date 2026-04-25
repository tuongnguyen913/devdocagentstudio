import type { SkillModuleData } from "./index";

export const featureData: SkillModuleData = {
  config: {
    id: "feature",
    name: "Feature Track",
    description: "Roadmap & theo dõi tiến độ tính năng",
    icon: "Zap",
    color: "#8B5CF6",
    active: true,
    version: "1.0.0",
    prompt: `Bạn là trợ lý tạo tài liệu Feature Tracking và Roadmap.\n\nNHIỆM VỤ:\n1. Tạo Product Roadmap (quarterly/yearly)\n2. Tạo Feature Specification document\n3. Tạo Sprint planning sheet\n4. Tạo Feature comparison matrix\n\nOUTPUT: JSON với roadmap phases, features list, timeline, priority.`,
    kvPrefix: "skill:feature",
    apiRoute: "/api/skills/feature",
    schemaVersion: "1.0.0",
    lastUpdated: "2026-04-20T15:00:00Z",
    updatedBy: "pm@devdocs.vn",
  },
  versions: [
    { id: "v-feature-001", version: "1.0.0", prompt: "Feature Track v1", changedBy: "pm@devdocs.vn", changedAt: "2026-04-20T15:00:00Z", changeSummary: "Phiên bản đầu tiên — Roadmap + Feature Spec", tokenCount: 220 },
  ],
  documents: [
    { id: "feature-001", skillId: "feature", fileName: "Roadmap_2026_Q2_Q3.xlsx", fileType: "xlsx", fileSize: 32000, downloadUrl: "/api/files/feature-001", userRequest: "Tạo roadmap Q2-Q3 2026 cho phần mềm QLVB", generatedAt: "2026-04-25T08:30:00Z", tokensUsed: 1100, status: "success" },
    { id: "feature-002", skillId: "feature", fileName: "FeatureSpec_ESignature.md", fileType: "md", fileSize: 18500, downloadUrl: "/api/files/feature-002", userRequest: "Tạo feature spec cho tính năng chữ ký điện tử", generatedAt: "2026-04-23T10:00:00Z", tokensUsed: 1400, status: "success" },
  ],
  stats: {
    totalGenerated: 15, totalTokensUsed: 18900, thisMonthGenerated: 4, thisMonthTokens: 4800, avgTokensPerRequest: 1260, successRate: 93.3,
    dailyUsage: [
      { date: "2026-04-19", count: 0, tokens: 0 }, { date: "2026-04-20", count: 1, tokens: 1200 },
      { date: "2026-04-21", count: 0, tokens: 0 }, { date: "2026-04-22", count: 0, tokens: 0 },
      { date: "2026-04-23", count: 1, tokens: 1400 }, { date: "2026-04-24", count: 1, tokens: 1100 },
      { date: "2026-04-25", count: 1, tokens: 1100 },
    ],
  },
};
