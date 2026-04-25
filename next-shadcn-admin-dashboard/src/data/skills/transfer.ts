import type { SkillModuleData } from "./index";

export const transferData: SkillModuleData = {
  config: {
    id: "transfer",
    name: "Transfer KN",
    description: "Tài liệu bàn giao nội bộ kỹ thuật",
    icon: "ArrowRightLeft",
    color: "#F59E0B",
    active: true,
    version: "1.0.0",
    prompt: `Bạn là trợ lý tạo tài liệu bàn giao kỹ thuật nội bộ.\n\nNHIỆM VỤ:\n1. Tạo tài liệu bàn giao dự án (project handover)\n2. Tạo checklist bàn giao\n3. Tạo knowledge base document\n4. Tạo onboarding guide cho developer mới\n\nCẤU TRÚC:\n- Tổng quan dự án\n- Kiến trúc hệ thống\n- Hướng dẫn setup môi trường\n- Danh sách tài khoản & credentials\n- Quy trình deploy\n- Known issues & workarounds\n- Liên hệ support\n\nOUTPUT: JSON với projectName, sections, checklist.`,
    kvPrefix: "skill:transfer",
    apiRoute: "/api/skills/transfer",
    schemaVersion: "1.0.0",
    lastUpdated: "2026-04-17T10:00:00Z",
    updatedBy: "lead@devdocs.vn",
  },
  versions: [
    { id: "v-transfer-001", version: "1.0.0", prompt: "Transfer KN v1", changedBy: "lead@devdocs.vn", changedAt: "2026-04-17T10:00:00Z", changeSummary: "Phiên bản đầu tiên — project handover", tokenCount: 290 },
  ],
  documents: [
    { id: "transfer-001", skillId: "transfer", fileName: "BanGiao_DuAn_QLVB.docx", fileType: "docx", fileSize: 85000, downloadUrl: "/api/files/transfer-001", userRequest: "Tạo tài liệu bàn giao dự án QLVB cho team mới", generatedAt: "2026-04-23T09:00:00Z", tokensUsed: 2200, status: "success" },
    { id: "transfer-002", skillId: "transfer", fileName: "Onboarding_DevGuide.md", fileType: "md", fileSize: 12400, downloadUrl: "/api/files/transfer-002", userRequest: "Tạo onboarding guide cho developer mới join team", generatedAt: "2026-04-21T14:00:00Z", tokensUsed: 1500, status: "success" },
  ],
  stats: {
    totalGenerated: 12, totalTokensUsed: 22800, thisMonthGenerated: 3, thisMonthTokens: 5900, avgTokensPerRequest: 1900, successRate: 91.7,
    dailyUsage: [
      { date: "2026-04-19", count: 0, tokens: 0 }, { date: "2026-04-20", count: 0, tokens: 0 },
      { date: "2026-04-21", count: 1, tokens: 1500 }, { date: "2026-04-22", count: 0, tokens: 0 },
      { date: "2026-04-23", count: 1, tokens: 2200 }, { date: "2026-04-24", count: 0, tokens: 0 },
      { date: "2026-04-25", count: 1, tokens: 2200 },
    ],
  },
};
