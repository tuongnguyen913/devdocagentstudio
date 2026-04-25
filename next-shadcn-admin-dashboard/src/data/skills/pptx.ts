import type { SkillModuleData } from "./index";

export const pptxData: SkillModuleData = {
  config: {
    id: "pptx",
    name: "PPTX",
    description: "Slide demo phần mềm cho khách hàng",
    icon: "Presentation",
    color: "#D24726",
    active: true,
    version: "1.2.0",
    prompt: `You are the PPTX skill for DevDocs Studio.

Your job is to generate professional, concise, government-appropriate software presentation decks in Vietnamese or English.

Core objectives:
1. Produce slide-ready structured content, not long prose.
2. Prioritize clarity, formal tone, and implementation value.
3. Keep each slide focused on one idea.
4. Avoid flashy startup language, hype, slang, and decorative excess.
5. When presenting software, explain business problem, workflow, features, benefits, rollout plan, and expected outcomes.

Output format:
Return strict JSON with:
- deckTitle
- subtitle
- audienceNote
- slides: [ { type, title, subtitle?, bullets?, cards?, steps?, metrics?, imageCaption?, speakerNote? } ]

Constraints:
- Maximum 12 words per slide title.
- Maximum 6 bullets per slide.
- Maximum 18 words per bullet.
- Use formal Vietnamese by default.`,
    kvPrefix: "skill:pptx",
    apiRoute: "/api/skills/pptx",
    schemaVersion: "1.2.0",
    lastUpdated: "2026-04-20T14:00:00Z",
    updatedBy: "admin@devdocs.vn",
  },
  versions: [
    {
      id: "v-pptx-002",
      version: "1.2.0",
      prompt: "You are the PPTX skill for DevDocs Studio...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-04-20T14:00:00Z",
      changeSummary: "Thêm executive briefing theme và metrics slide layout",
      tokenCount: 340,
    },
    {
      id: "v-pptx-001",
      version: "1.0.0",
      prompt: "Generate professional PowerPoint presentations...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-03-15T10:00:00Z",
      changeSummary: "Phiên bản đầu tiên — hỗ trợ software demo deck",
      tokenCount: 250,
    },
  ],
  documents: [
    {
      id: "pptx-001",
      skillId: "pptx",
      fileName: "GioiThieu_PM_QuanLyVanBan.pptx",
      fileType: "pptx",
      fileSize: 2450000,
      downloadUrl: "/api/files/pptx-001",
      userRequest: "Tạo slide giới thiệu phần mềm quản lý văn bản cho Sở Nội vụ, 12 slides",
      generatedAt: "2026-04-24T10:00:00Z",
      tokensUsed: 2800,
      status: "success",
    },
    {
      id: "pptx-002",
      skillId: "pptx",
      fileName: "BaoCao_TienDo_Q1_2026.pptx",
      fileType: "pptx",
      fileSize: 1800000,
      downloadUrl: "/api/files/pptx-002",
      userRequest: "Tạo slide báo cáo tiến độ dự án Q1/2026 cho ban lãnh đạo",
      generatedAt: "2026-04-22T15:30:00Z",
      tokensUsed: 2100,
      status: "success",
    },
  ],
  stats: {
    totalGenerated: 31,
    totalTokensUsed: 68500,
    thisMonthGenerated: 8,
    thisMonthTokens: 19200,
    avgTokensPerRequest: 2210,
    successRate: 93.5,
    dailyUsage: [
      { date: "2026-04-19", count: 1, tokens: 2200 },
      { date: "2026-04-20", count: 2, tokens: 4100 },
      { date: "2026-04-21", count: 0, tokens: 0 },
      { date: "2026-04-22", count: 1, tokens: 2100 },
      { date: "2026-04-23", count: 1, tokens: 2400 },
      { date: "2026-04-24", count: 2, tokens: 5600 },
      { date: "2026-04-25", count: 1, tokens: 2800 },
    ],
  },
};
