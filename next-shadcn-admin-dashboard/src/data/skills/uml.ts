import type { SkillModuleData } from "./index";

export const umlData: SkillModuleData = {
  config: {
    id: "uml",
    name: "UML Diagrams",
    description: "Use case, Class, Sequence diagram",
    icon: "GitBranch",
    color: "#6366F1",
    active: true,
    version: "1.1.0",
    prompt: `Bạn là trợ lý tạo sơ đồ UML chuyên nghiệp cho dự án phần mềm.

## NHIỆM VỤ
1. Tạo Use Case Diagram — mô tả actor và chức năng
2. Tạo Class Diagram — mô tả entity, relationship
3. Tạo Sequence Diagram — mô tả luồng xử lý
4. Tạo Activity Diagram — mô tả quy trình nghiệp vụ
5. Tạo ERD — Entity Relationship Diagram

## CÔNG CỤ
- Dùng cú pháp Mermaid hoặc PlantUML
- Render qua Kroki API (https://kroki.io)
- Output: SVG hoặc PNG

## QUY TẮC
- Diagram rõ ràng, không quá 15 class/entity
- Dùng tiếng Việt cho label khi khách hàng yêu cầu
- Comment bằng tiếng Việt
- Trả về cả mermaid source code và rendered image URL

## OUTPUT FORMAT
{
  "diagramType": "use-case|class|sequence|activity|erd",
  "title": "...",
  "source": "mermaid code here",
  "renderEngine": "mermaid|plantuml",
  "description": "Mô tả sơ đồ"
}`,
    kvPrefix: "skill:uml",
    apiRoute: "/api/skills/uml",
    schemaVersion: "1.1.0",
    lastUpdated: "2026-04-22T16:00:00Z",
    updatedBy: "dev@devdocs.vn",
  },
  versions: [
    {
      id: "v-uml-002",
      version: "1.1.0",
      prompt: "Bạn là trợ lý tạo sơ đồ UML...",
      changedBy: "dev@devdocs.vn",
      changedAt: "2026-04-22T16:00:00Z",
      changeSummary: "Thêm hỗ trợ ERD và Activity Diagram",
      tokenCount: 310,
    },
    {
      id: "v-uml-001",
      version: "1.0.0",
      prompt: "Generate UML diagrams using Mermaid syntax...",
      changedBy: "admin@devdocs.vn",
      changedAt: "2026-03-20T10:00:00Z",
      changeSummary: "Phiên bản đầu — Use Case, Class, Sequence",
      tokenCount: 200,
    },
  ],
  documents: [
    {
      id: "uml-001",
      skillId: "uml",
      fileName: "UseCase_QLVB.svg",
      fileType: "svg",
      fileSize: 15800,
      downloadUrl: "/api/files/uml-001",
      userRequest: "Vẽ Use Case Diagram cho hệ thống quản lý văn bản đến/đi",
      generatedAt: "2026-04-25T08:00:00Z",
      tokensUsed: 650,
      status: "success",
    },
    {
      id: "uml-002",
      skillId: "uml",
      fileName: "ClassDiagram_UserModule.svg",
      fileType: "svg",
      fileSize: 22400,
      downloadUrl: "/api/files/uml-002",
      userRequest: "Vẽ Class Diagram cho module quản lý người dùng và phân quyền",
      generatedAt: "2026-04-24T13:00:00Z",
      tokensUsed: 820,
      status: "success",
    },
    {
      id: "uml-003",
      skillId: "uml",
      fileName: "Sequence_Login_OTP.svg",
      fileType: "svg",
      fileSize: 12100,
      downloadUrl: "/api/files/uml-003",
      userRequest: "Vẽ Sequence Diagram cho luồng đăng nhập OTP",
      generatedAt: "2026-04-23T11:30:00Z",
      tokensUsed: 480,
      status: "success",
    },
  ],
  stats: {
    totalGenerated: 35,
    totalTokensUsed: 22750,
    thisMonthGenerated: 9,
    thisMonthTokens: 5850,
    avgTokensPerRequest: 650,
    successRate: 91.4,
    dailyUsage: [
      { date: "2026-04-19", count: 1, tokens: 600 },
      { date: "2026-04-20", count: 2, tokens: 1300 },
      { date: "2026-04-21", count: 1, tokens: 700 },
      { date: "2026-04-22", count: 0, tokens: 0 },
      { date: "2026-04-23", count: 2, tokens: 1100 },
      { date: "2026-04-24", count: 1, tokens: 820 },
      { date: "2026-04-25", count: 2, tokens: 1330 },
    ],
  },
};
