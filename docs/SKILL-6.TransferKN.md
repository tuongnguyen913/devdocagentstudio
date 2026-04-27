---
name: transfer-kn
description: "Use this skill whenever the user wants to create technical knowledge transfer documents, system handover documentation, developer onboarding guides, internal technical wikis, API reference documents, deployment guides, configuration manuals, architecture overviews, or any document whose purpose is to transfer technical knowledge from one person or team to another. Triggers include: tài liệu bàn giao, bàn giao kỹ thuật, transfer knowledge, TK document, onboarding developer, hướng dẫn setup môi trường, mô tả kiến trúc hệ thống, tài liệu vận hành, deployment guide, API document nội bộ, wiki kỹ thuật, system overview, handover document, hướng dẫn bảo trì. Do NOT use for user manuals aimed at end-users, release notes, bug reports, feature roadmaps, or slide presentations."
license: Proprietary. LICENSE.txt has complete terms.
---

# SKILL-6 — Transfer Knowledge (Bàn giao kỹ thuật)

## 1. Overview

Skill `transfer-kn` là module chuyên tạo tài liệu bàn giao kỹ thuật nội bộ — nhóm tài liệu **quan trọng nhất nhưng thường xuyên bị bỏ qua nhất** trong vòng đời phần mềm nhà nước. Đây là loại tài liệu phục vụ:

- Developer mới tiếp nhận hệ thống (`onboarding`).
- Bàn giao hệ thống từ đơn vị phát triển sang đơn vị vận hành.
- Bàn giao nội bộ khi thành viên team thay đổi.
- Lưu trữ kiến thức kỹ thuật dài hạn cho tổ chức.

### Phân loại tài liệu

| Loại | Mô tả | Đối tượng đọc | Format |
|---|---|---|---|
| **System Overview** | Tổng quan kiến trúc, stack, module | Developer mới, lãnh đạo kỹ thuật | `.docx` |
| **Setup Guide** | Hướng dẫn cài đặt môi trường dev/staging/prod | Developer | `.docx` / `.md` |
| **API Reference** | Mô tả các endpoint, request/response nội bộ | Developer tích hợp | `.docx` / `.md` |
| **Deployment Guide** | Quy trình build, deploy, rollback | DevOps, kỹ thuật viên | `.docx` |
| **Database Schema** | Mô tả cấu trúc CSDL, quan hệ bảng | Developer, DBA | `.docx` |
| **Operations Manual** | Hướng dẫn vận hành, xử lý sự cố, backup | Kỹ thuật viên vận hành | `.docx` |
| **Full Handover Pack** | Toàn bộ tài liệu bàn giao gộp thành 1 file | Đơn vị tiếp nhận | `.docx` |

### Tại sao cần skill này

Hệ thống nhà nước thường trải qua nhiều lần bàn giao:
- Nhà thầu bàn giao cho Sở/Ban/Phòng vận hành.
- Developer cũ rời công ty, developer mới tiếp nhận.
- Nâng cấp phiên bản lớn → cần tài liệu delta cho team vận hành.

Không có tài liệu → vận hành mù quáng → sự cố không xử lý được → trách nhiệm pháp lý. Với hệ thống nhà nước, thiếu tài liệu bàn giao còn có thể vi phạm quy định nghiệm thu theo Thông tư 13/2010/TT-BTTTT và các quy định đặc thù của từng đơn vị.

---

## 2. Quick Reference

| Task | Approach |
|---|---|
| Tạo System Overview | Template DOCX: kiến trúc + stack + module map |
| Tạo Setup Guide | Template DOCX theo thứ tự: prerequisites → install → config → verify |
| Tạo API Reference | Template DOCX bảng endpoint hoặc Markdown |
| Tạo Deployment Guide | Template DOCX: checklist từng bước, có rollback plan |
| Tạo Full Handover Pack | Gộp tất cả sections vào 1 DOCX, có TOC tự động |
| Mô tả database schema | Bảng DOCX: tên bảng, cột, kiểu dữ liệu, ràng buộc, mô tả |
| Tích hợp dữ liệu | AI parse input (text / JSON / code) → chuẩn hóa → render template |

---

## 3. Bản chất công nghệ

### 3.1 Core Libraries

Skill này **chủ yếu dùng `docx` (docx-js)** vì output là tài liệu dài, nhiều heading, có TOC, bảng phức tạp, và cần in được. Markdown export là tùy chọn phụ cho các team ưa wiki.

```ts
import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  ShadingType,
  TextRun,
  TableOfContents,
  Footer,
  Header,
  PageNumber,
  NumberFormat,
  Packer
} from "docx";
```

**Điểm đặc biệt so với SKILL-1 và SKILL-5:**

Skill này tạo tài liệu **rất dài** (20-60 trang), do đó cần:
- **TOC tự động** (Table of Contents) — bắt buộc.
- **Header/Footer** với tên hệ thống + số trang.
- **Section breaks** phân chia các phần lớn.
- **Numbered headings** (Heading 1.1, 1.2...) nếu tài liệu yêu cầu.
- **Code blocks** được mô phỏng bằng font `Courier New` + shading xám.

### 3.2 Flow xử lý
User input (text mô tả / JSON cấu trúc / code snippet)
↓
Claude API — phân tích, chuẩn hóa, bổ sung nội dung
↓
Document builder (docx-js) — render từng section
↓
Packer.toBuffer() → Vercel Blob upload
↓
{ downloadUrl, pageEstimate, format }

text

### 3.3 Constraint Vercel

- File có thể lớn (1-5MB) nếu có nhiều bảng và code block.
- Không cần LibreOffice — docx-js thuần Node.js.
- Với Full Handover Pack nhiều section, nên dùng **streaming Packer** thay vì `toBuffer()`:

```ts
const stream = Packer.toStream(doc);
// pipe stream trực tiếp lên Vercel Blob
```

- Dynamic import để giảm cold start:

```ts
const { Document, Packer, HeadingLevel } = await import("docx");
```

---

## 4. Data Model

### 4.1 SystemInfo

```ts
type SystemInfo = {
  systemName: string;
  systemCode?: string;           // Mã hệ thống nếu có
  version: string;
  description: string;
  objectives?: string[];
  scope?: string;
  users?: string[];              // Đối tượng người dùng
  techStack: {
    frontend?: string;
    backend?: string;
    database?: string;
    infrastructure?: string;
    thirdPartyServices?: string[];
    devTools?: string[];
  };
  modules: ModuleInfo[];
  externalIntegrations?: IntegrationInfo[];
  constraints?: string[];
  legalReferences?: string[];    // Văn bản pháp lý liên quan
};

type ModuleInfo = {
  name: string;
  code?: string;
  description: string;
  mainFeatures?: string[];
  technicalNotes?: string;
  owner?: string;
};

type IntegrationInfo = {
  name: string;
  type: "api" | "database" | "file" | "message-queue" | "ldap" | "sso";
  description: string;
  endpoint?: string;
  authMethod?: string;
  notes?: string;
};
```

### 4.2 EnvironmentConfig

```ts
type EnvironmentConfig = {
  name: "development" | "staging" | "production" | "uat";
  description?: string;
  prerequisites: PrerequisiteItem[];
  installSteps: InstallStep[];
  envVariables: EnvVariable[];
  verifySteps?: string[];
  commonIssues?: TroubleshootItem[];
};

type PrerequisiteItem = {
  name: string;
  version?: string;
  installCommand?: string;
  notes?: string;
};

type InstallStep = {
  order: number;
  title: string;
  commands?: string[];
  description?: string;
  warnings?: string[];
  expectedOutput?: string;
};

type EnvVariable = {
  key: string;
  description: string;
  example?: string;
  required: boolean;
  sensitive?: boolean;         // true → mask trong tài liệu
  defaultValue?: string;
};

type TroubleshootItem = {
  symptom: string;
  cause?: string;
  solution: string;
};
```

### 4.3 ApiEndpoint

```ts
type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  title: string;
  description?: string;
  authRequired?: boolean;
  requestHeaders?: { key: string; value: string; required: boolean }[];
  requestParams?: ApiParam[];
  requestBody?: ApiParam[];
  responseSuccess?: {
    statusCode: number;
    description?: string;
    example?: string;
  };
  responseErrors?: { statusCode: number; description: string }[];
  notes?: string;
};

type ApiParam = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
};
```

### 4.4 DatabaseTable

```ts
type DatabaseTable = {
  tableName: string;
  schema?: string;
  description: string;
  module?: string;
  columns: TableColumn[];
  indexes?: string[];
  relations?: string[];
  notes?: string;
};

type TableColumn = {
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
  defaultValue?: string;
  description: string;
};
```

### 4.5 DeploymentStep

```ts
type DeploymentProcedure = {
  environment: string;
  version: string;
  preDeployChecklist: string[];
  steps: DeployStep[];
  postDeployChecklist: string[];
  rollbackPlan: string[];
  contacts: ContactPerson[];
};

type DeployStep = {
  order: number;
  title: string;
  executor: string;            // Dev / DevOps / Admin
  commands?: string[];
  description?: string;
  estimatedTime?: string;
  checkPoint?: string;         // Cách kiểm tra bước này thành công
};

type ContactPerson = {
  role: string;
  name?: string;
  phone?: string;
  email?: string;
};
```

### 4.6 TransferKNSkillInput

```ts
type TransferKNSkillInput = {
  outputType:
    | "system-overview"
    | "setup-guide"
    | "api-reference"
    | "deployment-guide"
    | "database-schema"
    | "operations-manual"
    | "full-handover-pack";

  format: "docx" | "md";

  metadata: {
    projectName: string;
    projectCode?: string;
    version?: string;
    orgName?: string;
    contractCode?: string;
    preparedBy?: string;
    reviewedBy?: string;
    approvedBy?: string;
    date?: string;
    confidentiality?: "internal" | "confidential" | "public";
    classification?: string;   // Mức độ mật nếu cần
  };

  // Chọn các data source phù hợp với outputType
  systemInfo?: SystemInfo;
  environments?: EnvironmentConfig[];
  apiEndpoints?: ApiEndpoint[];
  databaseTables?: DatabaseTable[];
  deploymentProcedures?: DeploymentProcedure[];
  operationsNotes?: string;
  appendices?: { title: string; content: string }[];

  options?: {
    includeTOC?: boolean;        // mặc định true
    includePageNumbers?: boolean;
    includeVersionHistory?: boolean;
    includeSignatureBlock?: boolean;
    headerLogoUrl?: string;
    language?: "vi" | "en";
    numberedHeadings?: boolean;
    codeBlockStyle?: "shaded" | "bordered" | "plain";
  };
};
```

---

## 5. Template chuẩn

### 5.1 Full Handover Pack — cấu trúc tổng thể
BÌA TÀI LIỆU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Logo đơn vị]
TÀI LIỆU BÀN GIAO KỸ THUẬT
Tên hệ thống: [TÊN HỆ THỐNG]
Mã hệ thống: [MÃ]
Phiên bản: [X.Y.Z]
Đơn vị phát triển: [Tên]
Ngày bàn giao: [DD/MM/YYYY]
Mức độ: NỘI BỘ / MẬT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LỊCH SỬ PHIÊN BẢN TÀI LIỆU

Phiên bản	Ngày	Người soạn	Mô tả thay đổi
MỤC LỤC [TOC tự động]

PHẦN 1 — TỔNG QUAN HỆ THỐNG
1.1 Mục tiêu và phạm vi
1.2 Kiến trúc tổng thể
1.3 Stack công nghệ
1.4 Danh sách module
1.5 Tích hợp bên ngoài

PHẦN 2 — HƯỚNG DẪN THIẾT LẬP MÔI TRƯỜNG
2.1 Yêu cầu hệ thống
2.2 Môi trường Development
2.3 Môi trường Staging
2.4 Môi trường Production
2.5 Biến môi trường
2.6 Xử lý sự cố thường gặp khi cài đặt

PHẦN 3 — KIẾN TRÚC DATABASE
3.1 Tổng quan CSDL
3.2 Sơ đồ quan hệ
3.3 Mô tả chi tiết các bảng

PHẦN 4 — API VÀ TÍCH HỢP
4.1 Danh sách endpoint
4.2 Xác thực và phân quyền
4.3 Chi tiết từng endpoint

PHẦN 5 — QUY TRÌNH TRIỂN KHAI
5.1 Checklist trước triển khai
5.2 Các bước triển khai
5.3 Kiểm tra sau triển khai
5.4 Kế hoạch rollback

PHẦN 6 — VẬN HÀNH VÀ BẢO TRÌ
6.1 Lịch backup
6.2 Giám sát hệ thống
6.3 Xử lý sự cố thường gặp
6.4 Danh sách liên hệ hỗ trợ

PHỤ LỤC
A — Danh sách tài khoản dịch vụ
B — Sơ đồ mạng / hạ tầng
C — Checklist bàn giao

BIÊN BẢN BÀN GIAO (trang cuối)
Bên bàn giao: _ Ngày: _
Bên tiếp nhận: _ Ký xác nhận: _

text

---

### 5.2 Style config DOCX — chuẩn tài liệu kỹ thuật

```ts
const transferKNStyles = {
  default: {
    document: {
      run: {
        font: "Times New Roman",
        size: 24,                  // 12pt
        color: "1F2937"
      },
      paragraph: {
        spacing: { line: 360, lineRule: "auto" },  // 1.5 line spacing
        alignment: AlignmentType.BOTH
      }
    }
  },
  paragraphStyles: [
    {
      id: "DocTitle",
      name: "Document Title",
      run: {
        font: "Times New Roman",
        size: 32,                  // 16pt
        bold: true,
        color: "0B3A6E"
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240 }
      }
    },
    {
      id: "PartHeading",
      name: "Part Heading",
      run: {
        font: "Times New Roman",
        size: 28,                  // 14pt
        bold: true,
        color: "FFFFFF"
      },
      paragraph: {
        shading: { fill: "0B3A6E", type: ShadingType.SOLID },
        spacing: { before: 360, after: 120 },
        indent: { left: 160 },
        outlineLevel: 0
      }
    },
    {
      id: "SectionHeading",
      name: "Section Heading",
      run: {
        font: "Times New Roman",
        size: 26,                  // 13pt
        bold: true,
        color: "0B3A6E"
      },
      paragraph: {
        spacing: { before: 280, after: 100 },
        outlineLevel: 1
      }
    },
    {
      id: "SubsectionHeading",
      name: "Subsection Heading",
      run: {
        font: "Times New Roman",
        size: 24,                  // 12pt
        bold: true,
        color: "1F2937"
      },
      paragraph: {
        spacing: { before: 200, after: 80 },
        outlineLevel: 2
      }
    },
    {
      id: "CodeBlock",
      name: "Code Block",
      run: {
        font: "Courier New",
        size: 18,                  // 9pt
        color: "1F2937"
      },
      paragraph: {
        shading: { fill: "F3F4F6", type: ShadingType.SOLID },
        spacing: { before: 80, after: 80 },
        indent: { left: 360, right: 360 }
      }
    },
    {
      id: "TableHeader",
      name: "Table Header",
      run: {
        font: "Times New Roman",
        size: 20,                  // 10pt
        bold: true,
        color: "FFFFFF"
      }
    },
    {
      id: "TableBody",
      name: "Table Body",
      run: {
        font: "Times New Roman",
        size: 20,                  // 10pt
        color: "1F2937"
      },
      paragraph: { spacing: { after: 40 } }
    },
    {
      id: "Warning",
      name: "Warning",
      run: {
        font: "Times New Roman",
        size: 22,
        color: "92400E"
      },
      paragraph: {
        shading: { fill: "FEF3C7", type: ShadingType.SOLID },
        border: {
          left: { color: "D97706", size: 12, style: "single" }
        },
        indent: { left: 360 },
        spacing: { before: 120, after: 120 }
      }
    },
    {
      id: "Note",
      name: "Note",
      run: {
        font: "Times New Roman",
        size: 22,
        color: "1E40AF"
      },
      paragraph: {
        shading: { fill: "EFF6FF", type: ShadingType.SOLID },
        border: {
          left: { color: "3B82F6", size: 12, style: "single" }
        },
        indent: { left: 360 },
        spacing: { before: 120, after: 120 }
      }
    }
  ]
};
```

---

### 5.3 Page setup chuẩn A4

```ts
const pageSetup = {
  page: {
    margin: {
      top: 1418,      // 25mm
      bottom: 1418,   // 25mm
      left: 1701,     // 30mm
      right: 1134     // 20mm
    },
    size: {
      width: 11906,   // A4 width in TWIPs
      height: 16838   // A4 height in TWIPs
    }
  }
};
```

### 5.4 Header / Footer

```ts
const header = new Header({
  children: [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        bottom: { style: "single", size: 6, color: "0B3A6E" },
        top: { style: "none" }, left: { style: "none" }, right: { style: "none" }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({
                children: [new TextRun({
                  text: "[TÊN HỆ THỐNG] — Tài liệu bàn giao kỹ thuật",
                  font: "Times New Roman",
                  size: 18,
                  color: "6B7280"
                })]
              })]
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({
                  text: "Phiên bản: X.Y.Z",
                  font: "Times New Roman",
                  size: 18,
                  color: "6B7280"
                })]
              })]
            })
          ]
        })
      ]
    })
  ]
});

const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Trang ",
          font: "Times New Roman",
          size: 18,
          color: "6B7280"
        }),
        new PageNumber({ format: NumberFormat.DECIMAL }),
        new TextRun({
          text: " | NỘI BỘ — Không phát hành bên ngoài",
          font: "Times New Roman",
          size: 18,
          color: "6B7280"
        })
      ]
    })
  ]
});
```

### 5.5 TOC tự động

```ts
const toc = new TableOfContents("MỤC LỤC", {
  hyperlink: true,
  headingStyleRange: "1-3",
  stylesWithLevels: [
    new StyleLevel("PartHeading", 1),
    new StyleLevel("SectionHeading", 2),
    new StyleLevel("SubsectionHeading", 3)
  ]
});
// Lưu ý: TOC cần Word mở file và update fields để render đúng.
// Có thể thêm hướng dẫn: "Nhấn Ctrl+A → F9 để cập nhật mục lục"
```

---

### 5.6 Bảng mô tả API Endpoint
┌─────────────────────────────────────────────────────┐
│ POST /api/v1/auth/login [Auth: No] │
│ Đăng nhập hệ thống, trả về JWT token │
├─────────────┬───────────────────────────────────────┤
│ REQUEST │ │
│ Headers │ Content-Type: application/json │
├─────────────┼───────────────────────────────────────┤
│ Body │ username string Bắt buộc Tên đăng nhập │
│ │ password string Bắt buộc Mật khẩu │
│ │ deviceId string Tùy chọn Mã thiết bị │
├─────────────┼───────────────────────────────────────┤
│ RESPONSE │ │
│ 200 OK │ { token, refreshToken, expiresIn } │
│ 401 │ Sai thông tin đăng nhập │
│ 429 │ Quá số lần thử trong 15 phút │
├─────────────┼───────────────────────────────────────┤
│ Ghi chú │ Token có hiệu lực 8 giờ. Lưu trữ │
│ │ trong HttpOnly cookie, không localStorage │
└─────────────┴───────────────────────────────────────┘

text

---

### 5.7 Bảng mô tả Database Table
┌──────────────────────────────────────────────────────────────┐
│ Bảng: tbl_don_thu │
│ Schema: dbo | Module: Quản lý đơn thư │
│ Mô tả: Lưu toàn bộ đơn thư tiếp nhận từ công dân │
├──────────┬─────────────┬──────┬────┬───────────────────────┤
│ Cột │ Kiểu DL │ Null │ PK │ Mô tả │
├──────────┼─────────────┼──────┼────┼───────────────────────┤
│ id │ BIGINT │ No │ ✓ │ Khóa chính tự tăng │
│ ma_don │ NVARCHAR(20)│ No │ │ Mã đơn duy nhất │
│ tieu_de │ NVARCHAR(500)│ No │ │ Tiêu đề đơn thư │
│ noi_dung │ NTEXT │ Yes │ │ Nội dung chi tiết │
│ nguoi_gui│ BIGINT │ No │ │ FK → tbl_cong_dan.id │
│ ngay_nhan│ DATETIME │ No │ │ Ngày tiếp nhận │
│ trang_thai│ TINYINT │ No │ │ 1=Mới, 2=XL, 3=Đóng │
│ created_at│ DATETIME │ No │ │ Thời gian tạo bản ghi │
└──────────┴─────────────┴──────┴────┴───────────────────────┘
Indexes: IX_ma_don (unique), IX_nguoi_gui, IX_trang_thai, IX_ngay_nhan
Relations: nguoi_gui → tbl_cong_dan.id (FK, ON DELETE RESTRICT)

text

---

### 5.8 Biên bản bàn giao (trang cuối)
BIÊN BẢN BÀN GIAO TÀI LIỆU KỸ THUẬT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hôm nay, ngày _ tháng _ năm 2026, tại _
Chúng tôi gồm:

BÊN BÀN GIAO:
Đơn vị : _
Đại diện : _
Chức vụ : _

BÊN TIẾP NHẬN:
Đơn vị : _
Đại diện : _
Chức vụ : _

Tiến hành bàn giao tài liệu kỹ thuật hệ thống:
Tên hệ thống : _
Phiên bản : _
Số tài liệu : _

DANH MỤC TÀI LIỆU BÀN GIAO:
☐ Tổng quan hệ thống
☐ Hướng dẫn thiết lập môi trường
☐ Kiến trúc database
☐ Tài liệu API
☐ Quy trình triển khai
☐ Hướng dẫn vận hành

Hai bên đã kiểm tra và xác nhận tài liệu đầy đủ, chính xác.

Bên bàn giao Bên tiếp nhận
(Ký, ghi rõ họ tên) (Ký, ghi rõ họ tên)

_ _

text

---

## 6. System Prompt

> Lưu vào Vercel KV: `skill:transfer-kn:prompt`
You are the Knowledge Transfer (Transfer KN) skill for DevDocs Studio.

Your job is to generate comprehensive, professional technical handover documentation
for Vietnamese government software projects.

Context:

Target audience: new developers joining a project, operations teams receiving a system
from a development vendor, team leads reviewing architecture, IT administrators
responsible for day-to-day operations.

Documents must be thorough, accurate, and self-sufficient — a reader with no prior
context must be able to understand and operate the system after reading.

Vietnamese language is default unless otherwise specified.

Tone is formal and technical, but clear — avoid unnecessary jargon when plain language works.

─────────────────────────────────────────
BEHAVIOR BY OUTPUT TYPE
─────────────────────────────────────────

[system-overview]

Start with purpose and business context — not just technical details.

Describe the architecture at a high level first, then drill into each module.

Include tech stack in a structured table: layer → technology → version → notes.

List all external integrations with integration type, endpoint domain, and auth method.

Note any legal or regulatory constraints the system must comply with.

Mention known limitations or technical debt if provided.

[setup-guide]

Structure strictly as: Prerequisites → Installation → Configuration → Verification.

Every command must be on its own line and clearly formatted as code.

Warn about common pitfalls before the step that triggers them, not after.

List all required environment variables in a table: KEY | Description | Example | Required | Sensitive.

Mask sensitive values in examples: DATABASE_PASSWORD=- - - - - - - -

Include a "Quick Verify" section at the end with exact commands and expected outputs.

[api-reference]

Group endpoints by module or resource, not by HTTP method.

For each endpoint: method, path, description, auth requirement, request params,
request body, response structure, error codes, and usage notes.

Show realistic examples for request body and response — not just schema.

Flag deprecated endpoints clearly.

Include rate limiting and pagination notes where applicable.

[deployment-guide]

Provide an explicit pre-deploy checklist — things that MUST be done before deploying.

Number every deployment step. Include the executor role for each step (Dev / DevOps / Admin).

Include expected output or checkpoint for each step so the executor knows it succeeded.

The rollback plan must be specific: exact commands to revert, not just "restore backup".

Include a post-deploy checklist with smoke test steps.

List emergency contacts with roles and phone numbers.

[database-schema]

Describe each table: name, schema, module it belongs to, and business purpose.

Document every column: name, data type, nullable, PK/FK, default, and business meaning.

Describe all indexes and their purpose (performance / unique constraint / etc.).

Document all foreign key relationships and cascade behavior.

Note any stored procedures, triggers, or views that are critical to operation.

[operations-manual]

Cover: backup schedule, log file locations, monitoring metrics to watch.

Include a runbook for the top 5-10 most common operational issues.

Each runbook entry: symptom → likely cause → diagnostic steps → resolution → escalation path.

List all scheduled jobs (cron) with schedule, purpose, and failure impact.

Describe the process for creating/deactivating user accounts.

[full-handover-pack]

Combine all above sections in the standard order.

Generate a document version history table at the start.

Generate a comprehensive table of contents.

Include a handover sign-off page at the end.

Ensure all cross-references between sections are consistent.

─────────────────────────────────────────
CONTENT QUALITY RULES
─────────────────────────────────────────

Never write "TBD", "to be added", or placeholder text — if information is missing,
explicitly note "[Thông tin cần bổ sung: {mô tả thông tin còn thiếu}]" in the output.

Never fabricate technical details (IPs, connection strings, credentials, table names).

If the user provides incomplete input, generate a "dataGaps" list identifying what
is missing and what impact that has on the document's completeness.

Code commands must be exact and tested-looking — avoid commands that are obviously wrong.

Dates must be formatted DD/MM/YYYY in Vietnamese output.

Sensitive values (passwords, tokens, API keys) must never appear in plain text —
always mask with - - - - - - - - - or [MASKED].

Technical terms in Vietnamese context: use the established Vietnamese IT vocabulary.
Do not invent Vietnamese translations for well-known English terms (e.g., keep "API",
"token", "deploy", "backend", "frontend", "database" as-is).

─────────────────────────────────────────
OUTPUT FORMAT
─────────────────────────────────────────

Return strict JSON with the following structure:

{
"outputType": "...",
"metadata": { ... },
"documentSections": [
{
"sectionId": "1",
"title": "TỔNG QUAN HỆ THỐNG",
"level": 1,
"subsections": [
{
"sectionId": "1.1",
"title": "Mục tiêu và phạm vi",
"level": 2,
"content": "...",
"tables": [ ...],
"codeBlocks": [ ...],
"warnings": [ ...],
"notes": [ ...]
}
]
}
],
"appendices": [ ...],
"dataGaps": [ ...]
}

text

---

## 7. Admin Config Keys

| Key | Kiểu | Mô tả |
|---|---|---|
| `skill:transfer-kn:prompt` | string | System prompt chính |
| `skill:transfer-kn:outline:full-handover` | JSON | Cấu trúc mục lục chuẩn Full Handover Pack |
| `skill:transfer-kn:outline:setup-guide` | JSON | Cấu trúc mục lục chuẩn Setup Guide |
| `skill:transfer-kn:theme:docx` | JSON | Style config DOCX |
| `skill:transfer-kn:template:full-handover` | Blob URL | Template DOCX mẫu đầy đủ |
| `skill:transfer-kn:template:setup-guide` | Blob URL | Template DOCX mẫu setup guide |
| `skill:transfer-kn:legal-refs` | JSON Array | Danh sách văn bản pháp lý hay dùng |
| `skill:transfer-kn:versions` | JSON Array | Version history của config skill |

---

## 8. Critical Rules cho docx-js

### ❌ TOC chỉ render đúng khi dùng đúng style ID

```ts
// SAI — style ID không khớp với paragraphStyles
new TableOfContents("MỤC LỤC", {
  headingStyleRange: "1-3"  // chỉ nhận Heading1/2/3 mặc định
});

// ĐÚNG — dùng StyleLevel map với custom style IDs
new TableOfContents("MỤC LỤC", {
  hyperlink: true,
  headingStyleRange: "1-3",
  stylesWithLevels: [
    new StyleLevel("PartHeading", 1),
    new StyleLevel("SectionHeading", 2),
    new StyleLevel("SubsectionHeading", 3)
  ]
});
// Thêm ghi chú vào document: hướng dẫn người dùng nhấn Ctrl+A → F9 để update TOC
```

### ❌ Section break phải dùng đúng type

```ts
// Sau trang bìa và trước nội dung chính — dùng page break
new Paragraph({
  children: [new PageBreak()]
});

// Phân cách phần lớn — dùng section break với page restart
new Paragraph({
  pageBreakBefore: true,
  children: [new TextRun("")]
});
```

### ❌ Code block không dùng Preformatted — phải dùng custom style

```ts
// SAI — style "Code" không tồn tại mặc định trong docx-js
new Paragraph({ style: "Code", children: [...] });

// ĐÚNG — dùng custom style đã khai báo trong paragraphStyles
new Paragraph({
  style: "CodeBlock",
  children: [
    new TextRun({
      text: "npm install",
      font: "Courier New",
      size: 18
    })
  ]
});
```

### ❌ Bảng 6+ cột trên A4 portrait phải tính lại DXA

```ts
// A4 portrait usable width = 8400 DXA (sau khi trừ lề)
// Ví dụ bảng API với 6 cột:
const apiTableColWidths = ; // sum = 7400
// Không vượt quá 8400 DXA tổng cộng

// Nếu quá rộng → đổi sang A4 landscape cho section đó
// hoặc chia bảng thành 2 phần
```

### ❌ Tài liệu dài > 20 trang phải dùng Packer.toStream

```ts
// SAI — Packer.toBuffer() load hết vào RAM, OOM trên serverless
const buffer = await Packer.toBuffer(doc);

// ĐÚNG — stream để Vercel không bị timeout/OOM
import { PassThrough } from "stream";
const passThrough = new PassThrough();
Packer.toStream(doc).then(stream => {
  stream.pipe(passThrough);
});
// pipe passThrough lên Vercel Blob
```

### ❌ Masked values phải xử lý trước khi đưa vào template

```ts
const maskSensitive = (value: string, isSensitive: boolean): string => {
  if (!isSensitive) return value;
  return "- ".repeat(Math.min(value.length, 10));
};

// Trong bảng EnvVariable:
const displayValue = maskSensitive(envVar.example ?? "", envVar.sensitive ?? false);
```

---