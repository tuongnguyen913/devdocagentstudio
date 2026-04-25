import type { SkillModuleData } from "./index";

export const docxData: SkillModuleData = {
  config: {
    id: "docx",
    name: "DOCX",
    description: "Tài liệu hướng dẫn & công văn nhà nước",
    icon: "FileText",
    color: "#2B579A",
    active: true,
    version: "2.0.0",
    prompt: `Bạn là trợ lý sinh tài liệu Word chuyên nghiệp cho developer phần mềm phục vụ cơ quan nhà nước Việt Nam.

## NHIỆM VỤ
Khi nhận yêu cầu, hãy:
1. Xác định loại văn bản (công văn / báo cáo / biên bản / hướng dẫn sử dụng / tài liệu kỹ thuật)
2. Trả về JSON data theo schema phù hợp để serverless function render DOCX
3. Đảm bảo nội dung đúng văn phong, đúng thể thức

## CHUẨN VĂN BẢN HÀNH CHÍNH
- Font: Times New Roman, Unicode TCVN 6909:2001
- Cỡ chữ: 13pt nội dung, 14pt tên loại văn bản
- Lề: Trái 30mm, Phải 20mm, Trên 25mm, Dưới 25mm (Nghị định 30/2020/NĐ-CP)
- Khoảng cách dòng: 1.3 (tối thiểu đơn, tối đa 1.5)
- Căn lề nội dung: Đều 2 lề (justify)
- Thụt đầu dòng: 1cm

## VĂN PHONG
- Ngôn ngữ trang trọng, súc tích, rõ ràng
- Không dùng từ viết tắt chưa được giải thích
- Câu chủ động, tránh câu bị động khi không cần thiết

## OUTPUT FORMAT
Trả về JSON với cấu trúc:
{
  "documentType": "cong-van|bao-cao|bien-ban|huong-dan|tech-doc",
  "metadata": { "tieuDe": "...", "soKyHieu": "...", ... },
  "sections": [ { "heading": "...", "content": [...] } ],
  "signature": { "chuVuKy": "...", "tenNguoiKy": "..." }
}`,
    kvPrefix: "skill:docx",
    apiRoute: "/api/skills/docx",
    templateUrl: "",
    schemaVersion: "2.0.0",
    lastUpdated: "2026-04-25T10:30:00Z",
    updatedBy: "admin@devdocs.vn",
  },
  versions: [
    {
      id: "v-docx-003",
      version: "2.0.0",
      prompt: "Bạn là trợ lý sinh tài liệu Word chuyên nghiệp...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-04-25T10:30:00Z",
      changeSummary: "Cập nhật output schema v2, thêm hỗ trợ biên bản họp",
      tokenCount: 485,
    },
    {
      id: "v-docx-002",
      version: "1.1.0",
      prompt: "Bạn là AI tạo tài liệu Word theo chuẩn NĐ30...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-04-15T08:00:00Z",
      changeSummary: "Thêm hướng dẫn sử dụng phần mềm template",
      tokenCount: 380,
    },
    {
      id: "v-docx-001",
      version: "1.0.0",
      prompt: "Tạo văn bản Word cho cơ quan nhà nước...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-03-01T09:00:00Z",
      changeSummary: "Phiên bản đầu tiên — chỉ hỗ trợ công văn",
      tokenCount: 220,
    },
  ],
  documents: [
    {
      id: "doc-001",
      skillId: "docx",
      fileName: "CongVan_DeNghi_TrienKhai_PM.docx",
      fileType: "docx",
      fileSize: 45200,
      downloadUrl: "/api/files/doc-001",
      userRequest: "Tạo công văn đề nghị triển khai phần mềm quản lý văn bản tại Sở Tài chính",
      generatedAt: "2026-04-25T09:15:00Z",
      tokensUsed: 1250,
      status: "success",
    },
    {
      id: "doc-002",
      skillId: "docx",
      fileName: "HuongDan_SuDung_QLVB_v2.docx",
      fileType: "docx",
      fileSize: 128400,
      downloadUrl: "/api/files/doc-002",
      userRequest: "Tạo hướng dẫn sử dụng phần mềm quản lý văn bản cho người dùng cuối",
      generatedAt: "2026-04-24T14:30:00Z",
      tokensUsed: 3500,
      status: "success",
    },
    {
      id: "doc-003",
      skillId: "docx",
      fileName: "BienBan_NghiemThu_GD1.docx",
      fileType: "docx",
      fileSize: 32100,
      downloadUrl: "/api/files/doc-003",
      userRequest: "Tạo biên bản nghiệm thu giai đoạn 1 dự án phần mềm",
      generatedAt: "2026-04-23T16:00:00Z",
      tokensUsed: 980,
      status: "success",
    },
  ],
  stats: {
    totalGenerated: 47,
    totalTokensUsed: 52400,
    thisMonthGenerated: 12,
    thisMonthTokens: 15600,
    avgTokensPerRequest: 1115,
    successRate: 95.7,
    dailyUsage: [
      { date: "2026-04-19", count: 2, tokens: 2100 },
      { date: "2026-04-20", count: 1, tokens: 980 },
      { date: "2026-04-21", count: 3, tokens: 3450 },
      { date: "2026-04-22", count: 0, tokens: 0 },
      { date: "2026-04-23", count: 2, tokens: 2200 },
      { date: "2026-04-24", count: 1, tokens: 3500 },
      { date: "2026-04-25", count: 3, tokens: 3370 },
    ],
  },
};
