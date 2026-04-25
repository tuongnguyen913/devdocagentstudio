import type { SkillModuleData } from "./index";

export const excelData: SkillModuleData = {
  config: {
    id: "excel",
    name: "Excel",
    description: "Bảng báo giá & tracking tính năng",
    icon: "Sheet",
    color: "#217346",
    active: true,
    version: "1.0.0",
    prompt: `Bạn là trợ lý tạo bảng tính Excel chuyên nghiệp cho các dự án phần mềm.

## NHIỆM VỤ
1. Tạo bảng báo giá phần mềm với cấu trúc rõ ràng
2. Tạo bảng tracking tính năng (feature tracking matrix)
3. Tạo bảng so sánh giải pháp
4. Tạo template timeline dự án

## QUY TẮC
- Dùng header row với background color #217346 (xanh Excel), text trắng
- Số liệu tiền tệ format theo VNĐ: #,##0
- Cột STT luôn bắt đầu từ 1
- Sheet name ngắn gọn, không dấu, max 31 ký tự
- Tự động tính tổng, subtotal khi có cột số

## OUTPUT FORMAT
{
  "sheets": [{
    "name": "BaoGia",
    "headers": ["STT", "Hạng mục", "Đơn vị", "Số lượng", "Đơn giá", "Thành tiền"],
    "rows": [...],
    "formulas": { "F_TOTAL": "=SUM(F2:F{n})" }
  }]
}`,
    kvPrefix: "skill:excel",
    apiRoute: "/api/skills/excel",
    schemaVersion: "1.0.0",
    lastUpdated: "2026-04-18T09:00:00Z",
    updatedBy: "admin@devdocs.vn",
  },
  versions: [
    {
      id: "v-excel-001",
      version: "1.0.0",
      prompt: "Bạn là trợ lý tạo bảng tính Excel...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-04-18T09:00:00Z",
      changeSummary: "Phiên bản đầu tiên — báo giá và feature tracking",
      tokenCount: 280,
    },
  ],
  documents: [
    {
      id: "excel-001",
      skillId: "excel",
      fileName: "BaoGia_PM_QLVB_2026.xlsx",
      fileType: "xlsx",
      fileSize: 24500,
      downloadUrl: "/api/files/excel-001",
      userRequest: "Tạo bảng báo giá phần mềm quản lý văn bản gồm 5 module",
      generatedAt: "2026-04-24T11:00:00Z",
      tokensUsed: 850,
      status: "success",
    },
    {
      id: "excel-002",
      skillId: "excel",
      fileName: "FeatureMatrix_Sprint15.xlsx",
      fileType: "xlsx",
      fileSize: 18200,
      downloadUrl: "/api/files/excel-002",
      userRequest: "Tạo bảng tracking tính năng cho sprint 15",
      generatedAt: "2026-04-22T09:30:00Z",
      tokensUsed: 620,
      status: "success",
    },
  ],
  stats: {
    totalGenerated: 23,
    totalTokensUsed: 18400,
    thisMonthGenerated: 6,
    thisMonthTokens: 4200,
    avgTokensPerRequest: 800,
    successRate: 97.8,
    dailyUsage: [
      { date: "2026-04-19", count: 1, tokens: 700 },
      { date: "2026-04-20", count: 0, tokens: 0 },
      { date: "2026-04-21", count: 1, tokens: 850 },
      { date: "2026-04-22", count: 1, tokens: 620 },
      { date: "2026-04-23", count: 0, tokens: 0 },
      { date: "2026-04-24", count: 2, tokens: 1680 },
      { date: "2026-04-25", count: 1, tokens: 350 },
    ],
  },
};
