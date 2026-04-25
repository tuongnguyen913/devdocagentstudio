import type { SkillModuleData } from "./index";

export const bugReleaseData: SkillModuleData = {
  config: {
    id: "bug-release",
    name: "Bug & Release",
    description: "Theo dõi lỗi & release notes",
    icon: "Bug",
    color: "#EF4444",
    active: true,
    version: "1.0.0",
    prompt: `Bạn là trợ lý tạo Bug Report và Release Notes.\n\nNHIỆM VỤ:\n1. Bug Report chi tiết với steps to reproduce\n2. Release Notes chuyên nghiệp\n3. Changelog (Keep a Changelog format)\n4. Known Issues document\n\nOUTPUT: JSON với bugId, title, severity, stepsToReproduce, hoặc version, features, bugFixes, knownIssues.`,
    kvPrefix: "skill:bug-release",
    apiRoute: "/api/skills/bug-release",
    schemaVersion: "1.0.0",
    lastUpdated: "2026-04-19T11:00:00Z",
    updatedBy: "qa@devdocs.vn",
  },
  versions: [
    { id: "v-bug-001", version: "1.0.0", prompt: "Bug Report + Release Notes v1", changedBy: "qa@devdocs.vn", changedAt: "2026-04-19T11:00:00Z", changeSummary: "Phiên bản đầu tiên", tokenCount: 350 },
  ],
  documents: [
    { id: "bug-001", skillId: "bug-release", fileName: "ReleaseNotes_v3.2.0.md", fileType: "md", fileSize: 8500, downloadUrl: "/api/files/bug-001", userRequest: "Tạo release notes cho version 3.2.0", generatedAt: "2026-04-25T07:00:00Z", tokensUsed: 920, status: "success" },
    { id: "bug-002", skillId: "bug-release", fileName: "BugReport_LoginTimeout.docx", fileType: "docx", fileSize: 15600, downloadUrl: "/api/files/bug-002", userRequest: "Bug report lỗi timeout khi login SSO", generatedAt: "2026-04-24T16:30:00Z", tokensUsed: 680, status: "success" },
  ],
  stats: {
    totalGenerated: 18, totalTokensUsed: 14200, thisMonthGenerated: 5, thisMonthTokens: 3800, avgTokensPerRequest: 789, successRate: 100,
    dailyUsage: [
      { date: "2026-04-19", count: 1, tokens: 780 }, { date: "2026-04-20", count: 0, tokens: 0 },
      { date: "2026-04-21", count: 1, tokens: 650 }, { date: "2026-04-22", count: 0, tokens: 0 },
      { date: "2026-04-23", count: 0, tokens: 0 }, { date: "2026-04-24", count: 1, tokens: 680 },
      { date: "2026-04-25", count: 2, tokens: 1690 },
    ],
  },
};
