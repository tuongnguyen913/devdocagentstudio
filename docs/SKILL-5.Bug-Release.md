name: bug-release
description: "Use this skill whenever the user wants to create, manage, or export bug tracking reports, release notes, changelogs, hotfix summaries, version history documents, or QA test result reports. Triggers include: bug report, bug list, lỗi phần mềm, danh sách lỗi, release note, changelog, version history, bản ghi thay đổi, release checklist, hotfix summary, sprint retrospective, test result summary, or requests to produce structured defect and release documentation in Word (.docx), Excel (.xlsx), or Markdown format. Do NOT use for feature planning, roadmaps, UML diagrams, or general coding tasks."
license: Proprietary. LICENSE.txt has complete terms.
---

# SKILL-5 — Bug & Release

## 1. Overview

Skill `bug-release` là module chuyên tạo và xuất tài liệu theo dõi lỗi phần mềm và ghi nhận thay đổi phiên bản. Đây là nhóm tài liệu nội bộ kỹ thuật, phục vụ developer, QA, team lead, và bàn giao cho đơn vị triển khai.

### Mục tiêu chính

| Nhóm tài liệu | Mô tả | Format |
|---|---|---|
| Bug Report | Danh sách lỗi có mức độ, trạng thái, assignee, version | `.xlsx` hoặc `.docx` |
| Release Note | Changelog chuyên nghiệp theo từng phiên bản | `.docx` hoặc `.md` |
| Hotfix Summary | Báo cáo ngắn về bản vá khẩn | `.docx` |
| QA Test Result | Kết quả kiểm thử theo sprint/feature | `.docx` hoặc `.xlsx` |
| Version History | Lịch sử phiên bản toàn bộ hệ thống | `.docx` |

### Tại sao cần skill này

Với developer làm phần mềm nhà nước, các tài liệu lỗi và release thường bị bỏ qua hoặc viết tùy hứng. Nhưng khi bàn giao hệ thống, đơn vị vận hành và lãnh đạo kỹ thuật cần:
- Bằng chứng rằng lỗi đã được xử lý trước khi go-live.
- Changelog để đối chiếu khi có sự cố sau triển khai.
- Release note để thông báo chính thức tới người dùng nghiệp vụ.

---

## 2. Quick Reference

| Task | Approach |
|---|---|
| Tạo bug report mới | Dùng template Excel với các cột chuẩn |
| Tạo release note | Dùng template DOCX changelog chuẩn Keep-a-Changelog |
| Tạo hotfix summary | Dùng DOCX ngắn 1 trang, mô tả vấn đề + giải pháp |
| Export QA test result | Dùng Excel multi-sheet: Summary + Detail + Failed |
| Version history | DOCX bảng tổng hợp nhiều phiên bản |
| Tích hợp dữ liệu từ JSON | Parse input → map sang template → xuất file |

---

## 3. Bản chất công nghệ

### 3.1 Core Libraries

**SheetJS (`xlsx`)** — dùng cho Bug Report và QA Test Result dạng bảng nhiều cột:

```ts
import * as XLSX from "xlsx";

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(bugList);
XLSX.utils.book_append_sheet(wb, ws, "Bug List");
const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
```

**`docx` (docx-js)** — dùng cho Release Note, Hotfix Summary và Version History:

```ts
import { Document, Paragraph, Table, TableRow, TableCell } from "docx";

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ text: "RELEASE NOTE", heading: HeadingLevel.HEADING_1 }),
      // ... tables, paragraphs
    ]
  }]
});
const buffer = await Packer.toBuffer(doc);
```

### 3.2 Flow xử lý
User input (JSON hoặc text)
↓
Claude API → parse & enrich data
↓
Template engine (docx-js / SheetJS)
↓
Buffer → Vercel Blob upload
↓
{ downloadUrl, format, version }

text

### 3.3 Constraint Vercel

- Không có timeout đáng lo — file nhỏ, không cần LibreOffice.
- Bundle size ước tính: `docx` ~2MB + `SheetJS` ~2.5MB → tổng ~4.5MB.
- Bắt buộc dùng **dynamic import** để tránh tăng cold start:

```ts
const { default: XLSX } = await import("xlsx");
const { Document, Packer } = await import("docx");
```

---

## 4. Data Model

### 4.1 BugItem

```ts
type BugItem = {
  id: string;                 // BUG-001
  title: string;
  description?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  priority: "P1" | "P2" | "P3" | "P4";
  status:
    | "Open"
    | "In Progress"
    | "Fixed"
    | "Verified"
    | "Closed"
    | "Reopened";
  module?: string;
  reportedBy?: string;
  assignedTo?: string;
  reportedDate?: string;      // ISO 8601
  fixedDate?: string;
  fixedInVersion?: string;
  environment?: string;       // Dev / Staging / Production
  attachments?: string[];     // URLs screenshot
  notes?: string;
};
```

### 4.2 ReleaseVersion

```ts
type ChangeEntry = {
  id?: string;                // BUG-001 hoặc FEAT-023
  description: string;
  impact?: "low" | "medium" | "high";
  module?: string;
};

type ReleaseVersion = {
  version: string;            // semver: 1.2.3
  releaseDate: string;        // ISO 8601
  releaseType: "major" | "minor" | "patch" | "hotfix";
  summary?: string;
  breaking?: boolean;
  changes: {
    added?: ChangeEntry[];
    changed?: ChangeEntry[];
    fixed?: ChangeEntry[];
    removed?: ChangeEntry[];
    security?: ChangeEntry[];
    deprecated?: ChangeEntry[];
  };
  knownIssues?: string[];
  upgradeNotes?: string;
  testedBy?: string;
  approvedBy?: string;
};
```

### 4.3 QATestSuite

```ts
type QATestCase = {
  id: string;                 // TC-001
  title: string;
  module?: string;
  steps?: string;
  expectedResult?: string;
  actualResult?: string;
  status: "Pass" | "Fail" | "Skip" | "Blocked";
  severity?: "Critical" | "High" | "Medium" | "Low";
  testedBy?: string;
  testedDate?: string;
  linkedBugId?: string;       // BUG-xxx nếu fail
  notes?: string;
};

type QATestSuite = {
  suiteName: string;
  module?: string;
  sprint?: string;
  totalCases: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  passRate?: number;          // auto-calculated
  cases: QATestCase[];
};
```

### 4.4 BugReleaseSkillInput

```ts
type BugReleaseSkillInput = {
  outputType:
    | "bug-report"
    | "release-note"
    | "hotfix-summary"
    | "qa-test-result"
    | "version-history";

  format: "xlsx" | "docx" | "md";

  metadata: {
    projectName: string;
    projectVersion?: string;
    orgName?: string;
    preparedBy?: string;
    date?: string;
    environment?: string;
  };

  bugs?: BugItem[];
  releases?: ReleaseVersion[];
  testSuites?: QATestSuite[];

  groupBy?: "severity" | "module" | "status" | "assignee";
  includeStats?: boolean;
  includeCharts?: boolean;    // chỉ dùng trong xlsx, render PNG trước
  language?: "vi" | "en";
};
```

---

## 5. Template chuẩn

### 5.1 Bug Report Excel — 3 sheets

**Sheet 1: Summary**

| Tổng lỗi | Critical | High | Medium | Low | Open | Fixed | Closed |
|---|---|---|---|---|---|---|---|
| `=COUNT(...)` | ... | ... | ... | ... | ... | ... | ... |

**Sheet 2: Bug List** — đầy đủ cột theo BugItem:
ID | Tiêu đề | Module | Mức độ | Ưu tiên | Trạng thái |
Người báo | Người xử lý | Ngày báo | Ngày sửa | Phiên bản sửa | Ghi chú

text

**Sheet 3: By Module** — pivot tổng hợp số lỗi theo từng module.

**Quy tắc màu sắc severity:**

```ts
const severityColors = {
  Critical: "FF0000",   // đỏ
  High:     "FF6B35",   // cam
  Medium:   "FFD700",   // vàng
  Low:      "90EE90",   // xanh lá nhạt
};
```

**Quy tắc màu sắc status:**

```ts
const statusColors = {
  Open:          "FFDADA",
  "In Progress": "FFF3CD",
  Fixed:         "D4EDDA",
  Verified:      "CCE5FF",
  Closed:        "E2E3E5",
  Reopened:      "F8D7DA",
};
```

**Auto-filter & Freeze panes:**

```ts
ws["!autofilter"] = { ref: ws["!ref"] };
ws["!freeze"] = { xSplit: 0, ySplit: 1 };
```

---

### 5.2 Release Note DOCX — chuẩn Keep a Changelog

Cấu trúc document:
[TÊN DỰ ÁN] — RELEASE NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phiên bản : 1.2.3
Ngày phát hành : 27/04/2026
Loại : Minor Release
Người duyệt : [Tên]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TỔNG QUAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mô tả ngắn về bản phát hành...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[THÊM MỚI]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEAT-045 — Thêm tính năng xuất báo cáo PDF (Module: Báo cáo)

FEAT-047 — Hỗ trợ đăng nhập SSO với Microsoft 365

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[THAY ĐỔI]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEAT-039 — Cập nhật giao diện màn hình quản lý người dùng

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SỬA LỖI]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUG-023 — Lỗi không lưu được file khi tên chứa ký tự đặc biệt [High]

BUG-031 — Timeout khi xuất danh sách hơn 1.000 bản ghi [Critical]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[LỖI ĐÃ BIẾT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trên iOS Safari 16, popup đôi khi không đóng đúng cách (đang xử lý)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GHI CHÚ NÂNG CẤP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Không có breaking change. Nâng cấp trực tiếp từ 1.1.x không cần migrate dữ liệu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tài liệu này được tạo tự động bởi DevDocs Studio

text

**Style config docx-js:**

```ts
const releaseNoteStyles = {
  default: {
    document: {
      run: { font: "Times New Roman", size: 24 }
    }
  },
  paragraphStyles: [
    {
      id: "ReleaseHeading",
      name: "Release Heading",
      run: {
        font: "Times New Roman",
        size: 28,
        bold: true,
        color: "0B3A6E"
      },
      paragraph: { spacing: { before: 240, after: 120 } }
    },
    {
      id: "SectionLabel",
      name: "Section Label",
      run: {
        font: "Times New Roman",
        size: 24,
        bold: true,
        color: "FFFFFF"
      },
      paragraph: {
        shading: { fill: "0B3A6E" },
        spacing: { before: 200, after: 80 },
        indent: { left: 100 }
      }
    },
    {
      id: "BulletItem",
      name: "Bullet Item",
      run: { font: "Times New Roman", size: 22 },
      paragraph: {
        bullet: { level: 0 },
        spacing: { after: 60 },
        indent: { left: 360, hanging: 180 }
      }
    },
    {
      id: "MetaLabel",
      name: "Meta Label",
      run: {
        font: "Times New Roman",
        size: 20,
        color: "6B7280"
      },
      paragraph: { spacing: { after: 40 } }
    }
  ]
};
```

---

### 5.3 Hotfix Summary DOCX — 1 trang
BÁO CÁO XỬ LÝ SỰ CỐ KHẨN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mã sự cố : HOT-2026-042
Phiên bản : 1.2.4-hotfix
Thời gian : 26/04/2026 — 22:30
Mức độ : ■ NGHIÊM TRỌNG
Ảnh hưởng : Không thể đăng nhập — toàn bộ người dùng

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VẤN ĐỀ XẢY RA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Mô tả ngắn gọn triệu chứng, thời điểm phát sinh, phạm vi ảnh hưởng]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NGUYÊN NHÂN GỐC RỄ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Root cause kỹ thuật đã xác định]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GIẢI PHÁP ĐÃ THỰC HIỆN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Mô tả chính xác thao tác sửa: file/config/query thay đổi]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KẾT QUẢ SAU XỬ LÝ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Hệ thống hoạt động bình thường sau [X] phút
✓ Không mất dữ liệu người dùng
✓ Đã kiểm tra lại trên môi trường Production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BIỆN PHÁP PHÒNG NGỪA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Kế hoạch kỹ thuật hoặc quy trình để tránh tái diễn]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Người xử lý : _ Thời gian : _
Người duyệt : _ Ký xác nhận : _

text

---

### 5.4 Version History DOCX — bảng tổng hợp

Cấu trúc bảng (cột × hàng):
Phiên bản	Ngày	Loại	Tóm tắt	Người duyệt	Ghi chú
1.2.3	27/04/2026	Minor	Thêm xuất PDF, sửa 2 lỗi cao	Nguyễn A	—
1.2.2	10/04/2026	Patch	Sửa lỗi timeout báo cáo	Nguyễn A	—
1.2.1-hotfix	01/04/2026	Hotfix	Khẩn: lỗi đăng nhập	Trần B	HOT-042
text

Loại phiên bản được tô màu:
- `major` → nền đỏ nhạt `FFE0E0`
- `minor` → nền xanh nhạt `E0F0FF`
- `patch` → nền xám `F5F5F5`
- `hotfix` → nền cam nhạt `FFF0D0`

---

## 6. System Prompt

> Lưu vào Vercel KV: `skill:bug-release:prompt`
You are the Bug & Release skill for DevDocs Studio.

Your job is to parse, enrich, and structure bug and release data into professional
technical documentation for Vietnamese software development teams.

Context:

Target audience: developers, QA engineers, team leads, government IT administrators.

Documents must be precise, structured, and professional — not casual.

Vietnamese language is default unless the user specifies otherwise.

─────────────────────────────────────────
BEHAVIOR BY OUTPUT TYPE
─────────────────────────────────────────

[bug-report]

Validate and normalize each bug entry.

Fill missing fields with inferred values where safe to do so.

Classify severity if not provided:
Keywords like "crash", "không vào được", "mất dữ liệu", "không lưu được" → Critical
Keywords like "chậm", "lỗi hiển thị", "sai font" → Medium or Low

Group bugs by module first, then by severity descending.

Generate a statistics summary: total, by severity, by status, by assignee.

Flag unassigned Critical/High bugs as a risk item in the summary.

Do not fabricate bug IDs — use input IDs or leave blank if not provided.

[release-note]

Follow Keep a Changelog format strictly.

Separate entries into sections: Added, Changed, Fixed, Removed, Security, Deprecated.

Each entry must reference a bug ID or feature ID if available.

Breaking changes must be clearly marked with [BREAKING] prefix.

Upgrade notes must be specific — never write "no changes needed" unless confirmed.

If multiple versions are provided, sort descending (newest first).

[hotfix-summary]

Maximum equivalent of 1 printed page.

Root cause must be technically accurate and specific, not vague.

Impact scope must include: affected modules, affected user groups, data integrity status.

Resolution must describe exactly what code, config, or data was changed.

[qa-test-result]

Summarize pass/fail rates by module and by test suite.

Calculate passRate = passed / totalCases * 100 and include in summary.

Flag any Critical or High severity failures with explicit warning.

Include overall test coverage estimate if data allows.

[version-history]

Chronological table format, newest first.

Each row: version number, date (DD/MM/YYYY), release type, one-line summary, approver.

If a full release note exists, note its reference ID.

─────────────────────────────────────────
OUTPUT FORMAT
─────────────────────────────────────────

Return strict JSON matching the skill's data model.
The rendering engine will handle all final document layout and styling.

{
"outputType": "...",
"metadata": { ... },
"stats": { ... }, // for bug-report and qa-test-result
"content": [ ...] // array of structured sections/rows
}

─────────────────────────────────────────
CONSTRAINTS
─────────────────────────────────────────

Never fabricate bug IDs, version numbers, or dates.

If input data is incomplete, include a "dataGaps" field listing what is missing.

Use formal Vietnamese technical terms — avoid developer slang and casual language.

Do not include internal code comments, system paths, or raw stack traces in the final document.

Do not include marketing language or subjective praise.

Dates must always be formatted DD/MM/YYYY in Vietnamese output.

Severity labels in Vietnamese: Critical → Nghiêm trọng, High → Cao, Medium → Trung bình, Low → Thấp.

Status labels in Vietnamese: Open → Mới, In Progress → Đang xử lý, Fixed → Đã sửa,
Verified → Đã kiểm tra, Closed → Đã đóng, Reopened → Mở lại.

text

---

## 7. Admin Config Keys

| Key | Kiểu | Mô tả |
|---|---|---|
| `skill:bug-release:prompt` | string | System prompt chính |
| `skill:bug-release:severity-labels:vi` | JSON | Nhãn mức độ tiếng Việt |
| `skill:bug-release:status-labels:vi` | JSON | Nhãn trạng thái tiếng Việt |
| `skill:bug-release:theme:excel` | JSON | Màu sắc cột Excel |
| `skill:bug-release:theme:docx` | JSON | Style config DOCX |
| `skill:bug-release:template:release-note` | Blob URL | Template DOCX mẫu release note |
| `skill:bug-release:template:hotfix` | Blob URL | Template DOCX mẫu hotfix |
| `skill:bug-release:template:bug-report` | Blob URL | Template Excel mẫu bug report |
| `skill:bug-release:versions` | JSON Array | Version history của config skill |

---

## 8. Critical Rules cho docx-js & SheetJS

### ❌ Ngày tháng trong Excel phải dùng serial number

```ts
// SAI — SheetJS không tự parse string thành date cell
ws["F2"] = { v: "27/04/2026", t: "s" };

// ĐÚNG — dùng Excel serial number
const toExcelSerial = (isoDate: string): number => {
  const d = new Date(isoDate);
  return (d.getTime() - new Date("1899-12-30").getTime()) / 86400000;
};
ws["F2"] = { v: toExcelSerial("2026-04-27"), t: "n", z: "DD/MM/YYYY" };
```

### ❌ Bảng docx-js phải set chiều rộng cột bằng DXA, không dùng AUTO

```ts
// SAI — AUTO gây vỡ layout khi mở trên Word
new TableCell({
  width: { size: 0, type: WidthType.AUTO },
  children: [...]
})

// ĐÚNG — tổng các cột = 8400 DXA (an toàn cho A4 portrait)
const colWidths = ; // sum = 8400
new TableCell({
  width: { size: colWidths, type: WidthType.DXA },
  children: [new Paragraph("BUG-001")]
})
```

### ❌ Shading header row phải dùng ShadingType.SOLID

```ts
new TableRow({
  tableHeader: true,
  children: headers.map((label, i) =>
    new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: "0B3A6E", type: ShadingType.SOLID, color: "auto" },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: label,
              bold: true,
              color: "FFFFFF",
              size: 20,
              font: "Times New Roman"
            })
          ]
        })
      ]
    })
  )
})
```

### ❌ Ký tự đặc biệt trong bug title phải được sanitize trước khi đưa vào XML

```ts
const sanitizeXml = (str: string): string =>
  str.replace(/[<>&"']/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;"
  }[c] ?? c));
```

### ❌ SheetJS CE không hỗ trợ chart native — phải render PNG trước

```ts
// Nếu cần chart trong Excel, render bằng Canvas/Chart.js phía client
// hoặc dùng sharp/jimp để tạo ảnh phía server, rồi addImage
const imageId = wb.addImage({
  data: chartPngBase64,
  extension: "png"
});
ws.addImage(imageId, {
  tl: { col: 0, row: statsRows + 2 },
  ext: { w: 600, h: 300 }
});
```

### ❌ Bug list > 500 rows phải dùng stream write

```ts
// Thay vì XLSX.write(wb, ...) load toàn bộ vào memory
// Dùng streaming writer cho file lớn
import { stream } from "xlsx";
const wbStream = stream.to_xlsx(ws);
// pipe tới Vercel Blob upload stream
```

---