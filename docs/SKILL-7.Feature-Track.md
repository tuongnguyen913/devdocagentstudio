---
name: feature-track
version: 1.0.0
description: >
  Use this skill whenever the user wants to create, manage, or export
  feature tracking documents including roadmaps, sprint boards, backlog lists,
  progress dashboards, and release note drafts. Triggers include: roadmap,
  sprint planning, feature backlog, progress report, release note, velocity
  tracking, sprint board, feature status, quarterly planning, or any request
  to produce structured feature management output in .xlsx or .docx format.
  Do NOT use for bug tracking (use skill:bug-release), Word documents
  (use skill:docx), or presentation slides (use skill:pptx).
output_formats:
  - .xlsx (primary — multi-sheet workbook)
  - .docx (optional — release note formal document)
engine:
  - SheetJS (xlsx) — Excel generation
  - Anthropic Claude API — content generation & enrichment
  - docx — optional Word output for release notes
vercel_function: /api/skills/feature-track
kv_keys:
  prompt: skill:feature-track:prompt
  template: skill:feature-track:template_url
  columns_roadmap: skill:feature-track:columns:roadmap
  columns_backlog: skill:feature-track:columns:backlog
  themes: skill:feature-track:themes
  effort_mapping: skill:feature-track:effort-mapping
  versions: skill:feature-track:versions
max_duration: 60
target_audience:
  - Software developers
  - Project managers
  - Team leads
  - Government software implementation teams
language_default: vi
---

# SKILL-7 — Feature Track
## Quản lý vòng đời tính năng phần mềm

---

## 🧠 1. Skill này dùng để làm gì?

Feature Track là skill quản lý **toàn bộ vòng đời phát triển tính năng** —
từ lúc một ý tưởng được ghi vào backlog, qua các sprint, cho đến khi
release và bàn giao cho khách hàng.

### 🎯 Mục đích chính

Skill này được dùng khi bạn cần:

**📋 Lập kế hoạch tính năng**
- Roadmap theo quý (Q1/Q2/Q3/Q4)
- Phân nhóm tính năng theo module/component
- Estimate effort và priority cho từng item
- Gắn target date và assignee

**🏃 Theo dõi Sprint**
- Sprint board dạng To Do / In Progress / Done
- Tính velocity (% hoàn thành / sprint)
- Ghi nhận sprint goal và kết quả

**📦 Quản lý Backlog**
- Danh sách tính năng chờ có đầy đủ context
- Filter theo priority, module, assignee
- Link sang tài liệu kỹ thuật (SKILL-6 Transfer KN)

**📊 Báo cáo tiến độ**
- % hoàn thành theo module
- Trend velocity qua các sprint
- Dashboard tóm tắt cho lãnh đạo

**📝 Sinh Release Note**
- Tự động tổng hợp tính năng Done theo version
- AI viết executive summary bằng tiếng Việt
- Format chuẩn để gửi khách hàng hoặc đưa vào tài liệu bàn giao

---

## ⚙️ 2. Bản chất công nghệ phía sau

### 🧩 2.1 Output format

Skill xuất file **Excel `.xlsx`** vì:

- PM, leader, khách hàng nhà nước đều biết dùng Excel
- Filter/sort/pivot hoạt động tự nhiên, không cần tool phụ
- Conditional formatting trực quan cho status và priority
- Dễ đính kèm email, trình bày trong họp

**SheetJS** (`xlsx`) là engine chính — chạy tốt trên Node.js Serverless
mà không cần LibreOffice hay browser engine.

```bash
npm install xlsx              # SheetJS — core Excel engine
npm install @anthropic-ai/sdk # Claude API — content generation
npm install exceljs           # (tùy chọn) nếu cần cell styling đầy đủ
```

### 🗂️ 2.2 Cấu trúc file xuất ra
feature-track-[projectName]-[yyyymmdd].xlsx
├── Sheet 1: ROADMAP ← Kế hoạch theo quý
├── Sheet 2: SPRINT_CURRENT ← Sprint đang chạy (kanban-style)
├── Sheet 3: BACKLOG ← Toàn bộ backlog chưa làm
├── Sheet 4: PROGRESS ← Dashboard % hoàn thành
└── Sheet 5: RELEASE_NOTES ← Nháp release note (AI-generated)

text

### 📐 2.3 Giới hạn kỹ thuật trên Vercel Serverless

| Giới hạn | Vercel Hobby | Vercel Pro |
|---|---|---|
| Execution timeout | 10s | 60s |
| Max bundle size | 50MB | 250MB |
| Memory | 1024MB | 3008MB |
| SheetJS bundle | ~2.5MB ✅ | ~2.5MB ✅ |
| exceljs bundle | ~5MB ✅ | ~5MB ✅ |
| Concurrent requests | 10 | Unlimited |

> ⚠️ Với file có >300 features, cần Vercel Pro để tránh timeout.
> Giải pháp Hobby: phân trang input, tách request theo sheet.

---

## 🏗️ 3. Cấu trúc dữ liệu

### 3.1 FeatureItem — đơn vị cơ bản

```typescript
type FeatureStatus =
  | "Backlog"
  | "Planned"
  | "In Progress"
  | "In Review"
  | "Testing"
  | "Done"
  | "Cancelled"
  | "Deferred";

type FeatureItem = {
  id: string;                  // "FEAT-001" — bắt buộc, unique
  title: string;               // Tên tính năng — bắt buộc
  description: string;         // Mô tả ngắn gọn
  module: string;              // Module/component chứa tính năng
  status: FeatureStatus;       // Bắt buộc
  priority: "Critical" | "High" | "Medium" | "Low";
  effort: "XS" | "S" | "M" | "L" | "XL"; // Story points tương đối
  assignee?: string;
  reporter: string;
  sprintId?: string;           // "SPRINT-12"
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  year?: number;               // 2026
  startDate?: string;          // ISO: "2026-04-01"
  targetDate?: string;
  doneDate?: string;
  acceptanceCriteria?: string[];
  techSpecUrl?: string;        // Link tài liệu SKILL-6
  releaseVersion?: string;     // "v1.2.0"
  tags?: string[];
  notes?: string;
};
```

### 3.2 Sprint

```typescript
type Sprint = {
  id: string;           // "SPRINT-12"
  name: string;         // "Sprint 12 — Tháng 4/2026"
  startDate: string;    // ISO date
  endDate: string;
  goal: string;         // Mục tiêu sprint (1-2 câu)
  features: FeatureItem[];
  velocity?: number;    // Actual story points completed
  status: "Active" | "Completed" | "Upcoming";
};
```

### 3.3 Release

```typescript
type Release = {
  version: string;          // "v2.1.0" — semver
  name?: string;            // "Bản cập nhật Tháng 4/2026"
  releaseDate: string;      // ISO date
  highlights: string[];     // 3-5 điểm nổi bật
  features: FeatureItem[];  // Features có status=Done
  bugFixes?: string[];      // Bug IDs hoặc mô tả
  breakingChanges?: string[];
  knownIssues?: string[];
};
```

### 3.4 Input API Schema

```typescript
type FeatureTrackInput = {
  projectName: string;
  projectVersion?: string;

  requestType:
    | "full-report"         // Xuất đầy đủ 5 sheets
    | "roadmap-only"        // Chỉ sheet ROADMAP
    | "sprint-board"        // Chỉ sheet SPRINT_CURRENT
    | "backlog"             // Chỉ sheet BACKLOG
    | "release-note-draft"; // Chỉ sheet RELEASE_NOTES

  // Data đầu vào
  features?: FeatureItem[];
  activeSprint?: Sprint;
  releases?: Release[];

  // Cấu hình xuất
  language?: "vi" | "en";
  includeAISummary?: boolean;    // Claude sinh executive summary
  quarterFilter?: string[];      // ["Q2 2026", "Q3 2026"]
  statusFilter?: FeatureStatus[];
  moduleFilter?: string[];

  // Metadata file
  teamName?: string;
  reportDate?: string;
  generatedBy?: string;
};
```

---

## 📊 4. Chi tiết từng Sheet

### Sheet 1: ROADMAP

**Mục đích:** Cái nhìn tổng thể kế hoạch phát triển, nhóm theo quý.

**Cột:**

| Cột | Kiểu dữ liệu | Ghi chú |
|---|---|---|
| ID | Text | FEAT-001, FEAT-002... |
| Tên tính năng | Text | Bold, wrap text |
| Module | Text | Dropdown validation |
| Mô tả ngắn | Text | Wrap text, width 200px |
| Priority | Text | Color-coded |
| Effort | Text | XS / S / M / L / XL |
| Quarter | Text | Q1 2026, Q2 2026... |
| Target Date | Date | dd/mm/yyyy |
| Assignee | Text | |
| Status | Text | Conditional formatting |
| Version | Text | v1.0, v1.1... |
| Notes | Text | |

**Conditional formatting:**
Status = "Done" → nền #D4EDDA (xanh lá nhạt)
Status = "In Progress" → nền #D1ECF1 (xanh dương nhạt)
Status = "Cancelled" → strikethrough + nền #E2E3E5 (xám nhạt)
Status = "Deferred" → nền #FFF3CD (vàng nhạt)
Status = "Testing" → nền #E2D9F3 (tím nhạt)
Priority = "Critical" → chữ đỏ đậm #DC3545
Priority = "High" → chữ cam #FD7E14

text

**Layout:**
- Freeze Row 1 (header) + Column A (ID)
- Group by Quarter: mỗi quý có header row màu navy `#0B3A6E`, chữ trắng
- Auto-filter bật cho tất cả cột
- Column widths: ID=80, Title=200, Module=120, Desc=200, Priority=90...

---

### Sheet 2: SPRINT_CURRENT

**Mục đích:** Kanban-style sprint board, trực quan hóa sprint đang chạy.

**Layout:**
┌─────────────────────────────────────────────────────────────────┐
│ Sprint Goal: [Hoàn thiện module báo cáo lãnh đạo] │
│ Sprint: SPRINT-12 | 01/04/2026 – 15/04/2026 │
├───────────────────────┬──────────────────────┬──────────────────┤
│ 📋 TO DO (4) │ 🔄 IN PROGRESS (3) │ ✅ DONE (5) │
│ header: #6C757D │ header: #0B3A6E │ header: #155724│
├───────────────────────┼──────────────────────┼──────────────────┤
│ FEAT-015 │ FEAT-012 │ FEAT-001 │
│ Dashboard tổng hợp │ Export PDF báo cáo │ Login SSO │
│ Priority: High │ Priority: Critical │ Priority: High │
│ Effort: L │ Effort: XL │ Effort: M │
│ Assignee: Minh │ Assignee: Hoa │ Assignee: Nam │
├───────────────────────┴──────────────────────┴──────────────────┤
│ Total: 12 | Done: 5 (41.7%) | Velocity: -- | Days left: 8│
└─────────────────────────────────────────────────────────────────┘

text

**Summary row:** Tính tự động từ data features trong sprint.

---

### Sheet 3: BACKLOG

**Mục đích:** Danh sách đầy đủ tất cả feature chưa làm, sắp theo priority.

**Cột:**

| Cột | Mô tả |
|---|---|
| ID | Auto-format: FEAT-xxx |
| Title | Tên tính năng |
| Module | Nhóm module |
| Description | Mô tả chi tiết (wrap text) |
| Priority | Critical / High / Medium / Low |
| Effort | XS → XL (kèm số points) |
| Status | Backlog / Planned / Deferred |
| Target Quarter | Q1 2026... |
| Reporter | Người tạo item |
| Created Date | dd/mm/yyyy |
| Acceptance Criteria | Điều kiện hoàn thành |
| Tech Spec URL | Link tài liệu SKILL-6 (hyperlink) |
| Tags | Comma-separated |
| Notes | Ghi chú |

**Sort mặc định:** Priority (Critical → Low) → Effort (XL → XS).

**Auto-filter:** Bật cho tất cả cột.

---

### Sheet 4: PROGRESS

**Mục đích:** Dashboard tổng hợp, dùng báo cáo nhanh với lãnh đạo.

**Cấu trúc:**
[SECTION A] TỔNG QUAN DỰ ÁN
─────────────────────────────────────
Dự án: Hệ thống Quản lý Đơn thư
Phiên bản: v2.1
Ngày báo cáo: 27/04/2026
Team: Team Phát triển Tỉnh X
─────────────────────────────────
Tổng tính năng: 48
✅ Hoàn thành: 32 (66.7%)
🔄 Đang làm: 8 (16.7%)
📋 Backlog: 8 (16.7%)

[SECTION B] TIẾN ĐỘ THEO MODULE
─────────────────────────────────────
Module │ Total │ Done │ % │ Progress
─────────────────────────────────────────────────────
Quản lý đơn thư │ 12 │ 10 │ 83% │ ████████░░
Báo cáo lãnh đạo │ 8 │ 6 │ 75% │ ███████░░░
Dashboard tổng hợp │ 6 │ 4 │ 67% │ ██████░░░░
Phân công xử lý │ 10 │ 7 │ 70% │ ███████░░░
Tích hợp SMS/Email │ 6 │ 3 │ 50% │ █████░░░░░
Admin & Phân quyền │ 6 │ 2 │ 33% │ ███░░░░░░░

[SECTION C] TIẾN ĐỘ SPRINT (3 sprint gần nhất)
─────────────────────────────────────
Sprint │ Planned │ Done │ Velocity │ Trend
─────────────────────────────────────────────────
SPRINT-10 │ 12 │ 11 │ 92% │ ↑
SPRINT-11 │ 10 │ 8 │ 80% │ ↓
SPRINT-12 │ 8 │ 3 │ -- │ (Active)

[SECTION D] PHÂN BỔ PRIORITY (backlog còn lại)
─────────────────────────────────────
🔴 Critical: 4 ████
🟠 High: 18 ██████████████████
🟡 Medium: 20 ████████████████████
🟢 Low: 6 ██████

text

**Color rules:**
% >= 80 → xanh lá #28A745
% 50-79 → cam #FFC107
% < 50 → đỏ #DC3545

text

**Bar chart:** Dùng Unicode `█` (filled) và `░` (empty) — không cần
Excel chart engine, SheetJS sinh text trực tiếp.

```typescript
function makeProgressBar(percent: number, width = 10): string {
  const filled = Math.round((percent / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}
```

---

### Sheet 5: RELEASE_NOTES

**Mục đích:** Nháp release note cho version hiện tại, AI sinh từ Done items.

**Format:**
═══════════════════════════════════════════════════════════
RELEASE NOTES — v2.1.0
Ngày phát hành: 30/04/2026
Phạm vi: Hệ thống Quản lý Đơn thư Tỉnh X
═══════════════════════════════════════════════════════════

📌 ĐIỂM NỔI BẬT
──────────────────────────────────────────────────────────
- [AI-generated executive summary, 3-5 câu tiếng Việt]
- [Nhấn mạnh giá trị nghiệp vụ, không dùng jargon kỹ thuật]

✅ TÍNH NĂNG MỚI (n items)
──────────────────────────────────────────────────────────
[FEAT-001] [Module: Quản lý đơn]
Tiếp nhận đơn trực tuyến qua cổng dịch vụ công
→ Công dân có thể nộp đơn 24/7, giảm tải cho bộ phận
tiếp nhận trực tiếp.

[FEAT-003] [Module: Báo cáo]
Xuất báo cáo tổng hợp định kỳ tự động
→ Sinh file Word/Excel đúng mẫu biểu Bộ Nội vụ,
tiết kiệm 3-4 giờ làm việc mỗi tuần.

🔧 CẢI TIẾN (n items)
──────────────────────────────────────────────────────────
[FEAT-008] Tăng tốc độ tải danh sách đơn lớn (>1000 bản ghi)
[FEAT-012] Cải thiện giao diện mobile cho cán bộ xã

🐛 SỬA LỖI (n items)
──────────────────────────────────────────────────────────
[BUG-020] Lỗi hiển thị ngày tháng sai múi giờ
[BUG-025] Không gửi được email thông báo khi CC nhiều người

⚠️ THAY ĐỔI CÓ THỂ ẢNH HƯỞNG HỆ THỐNG
──────────────────────────────────────────────────────────
Không có thay đổi breaking trong phiên bản này.

📋 VẤN ĐỀ ĐÃ BIẾT (Known Issues)
──────────────────────────────────────────────────────────
- [Mô tả vấn đề và workaround nếu có]

═══════════════════════════════════════════════════════════
Tài liệu hướng dẫn: [URL] | Hỗ trợ kỹ thuật: [contact]
Phiên bản tiếp theo: v2.2.0 — dự kiến 15/05/2026
═══════════════════════════════════════════════════════════

text

---

## 💡 5. System Prompt (lưu vào Vercel KV)
Key: skill:feature-track:prompt

text
You are the Feature Track skill for DevDocs Studio.

Your job is to help software development teams — especially those building
government software in Vietnam — structure, analyze, and document feature
planning and progress data.

CORE TASKS:

Parse raw feature data (JSON, natural language text, or bullet lists)
into structured FeatureItem arrays.

Organize features into roadmap quarters, sprint boards, and prioritized
backlog lists.

Generate an executive summary for the Progress dashboard (Vietnamese).

Draft professional release notes in Vietnamese, emphasizing business value
and operational impact for government clients — not technical details.

Suggest realistic priority and effort estimates when not provided, based
on feature complexity described.

Detect and flag risks:

Critical features stuck in Backlog too long (>2 sprints)

Features with no assignee or no target date

Sprint overloading (too many Critical/High in one sprint)

Modules with <50% completion close to target quarter end

LANGUAGE RULES:

Default language: Vietnamese

Tone: Professional, administrative, implementation-focused

Avoid: startup jargon, English tech terms when Vietnamese exists

For government audience: emphasize compliance, reliability, process
improvement, and time savings for civil servants

EFFORT MAPPING (Fibonacci-like):
XS = 1 point (1-2 hours — UI text change, small config)
S = 2 points (half day — simple CRUD, minor feature)
M = 3 points (1-2 days — standard feature with validation)
L = 5 points (3-4 days — complex feature, multiple components)
XL = 8 points (1 week+ — major feature, integration, architecture)

PRIORITY GUIDELINES:
Critical: Blocks go-live or causes data loss / security issue
High: Core business requirement, needed for acceptance
Medium: Important but has workaround
Low: Nice to have, can defer to next version

OUTPUT FORMAT:
Return strict JSON with this structure:
{
"features": [FeatureItem[]],
"suggestedSprints": [Sprint[]],
"aiNotes": {
"executiveSummary": "3-5 câu tiếng Việt tóm tắt tình trạng dự án",
"risksDetected": ["string array of risks"],
"suggestedActions": ["string array of recommendations"],
"releaseHighlights": ["3-5 bullet points for release notes"],
"velocityTrend": "increasing | decreasing | stable | insufficient-data"
} }

CONSTRAINTS:

Never invent feature IDs — use provided IDs or flag as "needs-id"

Never change status of existing features — only report as given

Date format: dd/mm/yyyy for Vietnamese display context

Velocity = (Done_points / Planned_points) * 100, rounded to 1 decimal

If input is ambiguous, make reasonable assumptions and note them in
aiNotes.suggestedActions

text

---

## 🔧 6. API Route

```typescript
// app/api/skills/feature-track/route.ts
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";
import type { FeatureTrackInput } from "@/types/feature-track";

export const maxDuration = 60; // Yêu cầu Vercel Pro

export async function POST(req: NextRequest) {
  const body: FeatureTrackInput = await req.json();

  // 1. Load skill config từ KV
  const [prompt, templateUrl] = await Promise.all([
    kv.get<string>("skill:feature-track:prompt"),
    kv.get<string>("skill:feature-track:template_url"),
  ]);

  // 2. Gọi Claude để xử lý và làm giàu dữ liệu
  let enrichedData = body;
  if (body.includeAISummary !== false) {
    const claude = new Anthropic();
    const msg = await claude.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: prompt || DEFAULT_PROMPT,
      messages: [{
        role: "user",
        content: JSON.stringify({
          requestType: body.requestType,
          projectName: body.projectName,
          features: body.features,
          activeSprint: body.activeSprint,
          releases: body.releases,
          language: body.language ?? "vi",
        }),
      }],
    });

    const aiOutput = JSON.parse(
      (msg.content as { text: string }).text
    );
    enrichedData = { ...body, ...aiOutput };
  }

  // 3. Build workbook
  const wb = XLSX.utils.book_new();
  const type = body.requestType;

  if (type === "full-report" || type === "roadmap-only") {
    XLSX.utils.book_append_sheet(wb, buildRoadmapSheet(enrichedData), "ROADMAP");
  }
  if (type === "full-report" || type === "sprint-board") {
    XLSX.utils.book_append_sheet(wb, buildSprintSheet(enrichedData), "SPRINT_CURRENT");
  }
  if (type === "full-report" || type === "backlog") {
    XLSX.utils.book_append_sheet(wb, buildBacklogSheet(enrichedData), "BACKLOG");
  }
  if (type === "full-report") {
    XLSX.utils.book_append_sheet(wb, buildProgressSheet(enrichedData), "PROGRESS");
  }
  if (type === "full-report" || type === "release-note-draft") {
    XLSX.utils.book_append_sheet(wb, buildReleaseNotesSheet(enrichedData), "RELEASE_NOTES");
  }

  // 4. Serialize → Vercel Blob
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const safeProject = body.projectName.replace(/\s+/g, "-").toLowerCase();
  const filename = `feature-track-${safeProject}-${Date.now()}.xlsx`;

  const { url } = await put(filename, buffer, {
    access: "public",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    addRandomSuffix: false,
  });

  return Response.json({
    success: true,
    downloadUrl: url,
    filename,
    meta: {
      sheetsGenerated: wb.SheetNames,
      totalFeatures: enrichedData.features?.length ?? 0,
      requestType: body.requestType,
      aiNotes: (enrichedData as any).aiNotes ?? null,
    },
  });
}
```

---

## 🎨 7. Styling Helpers

```typescript
// lib/feature-track/styles.ts

export const PALETTE = {
  navy:        "0B3A6E",
  white:       "FFFFFF",
  greenDark:   "155724",
  greenLight:  "D4EDDA",
  blueLight:   "D1ECF1",
  yellowLight: "FFF3CD",
  redLight:    "F8D7DA",
  purpleLight: "E2D9F3",
  gray:        "6C757D",
  grayLight:   "F8F9FA",
  border:      "D1D5DB",
  text:        "1F2937",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Critical: "DC3545",
  High:     "FD7E14",
  Medium:   "FFC107",
  Low:      "28A745",
};

export const STATUS_BG: Record<string, string> = {
  "Done":        "D4EDDA",
  "In Progress": "D1ECF1",
  "Testing":     "E2D9F3",
  "In Review":   "CCE5FF",
  "Cancelled":   "E2E3E5",
  "Deferred":    "FFF3CD",
};

export const EFFORT_POINTS: Record<string, number> = {
  XS: 1, S: 2, M: 3, L: 5, XL: 8,
};

// Unicode progress bar — không cần Excel chart engine
export function progressBar(percent: number, width = 10): string {
  const filled = Math.round((percent / 100) * width);
  return "█".repeat(Math.max(0, filled)) +
         "░".repeat(Math.max(0, width - filled));
}

// Format date sang dd/mm/yyyy cho ngữ cảnh Việt Nam
export function toVNDate(iso: string): string {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// Tính tổng story points
export function calcPoints(features: FeatureItem[]): number {
  return features.reduce((sum, f) => sum + (EFFORT_POINTS[f.effort] ?? 0), 0);
}

// Tính velocity
export function calcVelocity(done: FeatureItem[], total: FeatureItem[]): number {
  const donePts  = calcPoints(done);
  const totalPts = calcPoints(total);
  if (totalPts === 0) return 0;
  return Math.round((donePts / totalPts) * 1000) / 10; // 1 decimal
}
```

> **⚠️ Lưu ý SheetJS Community Edition:**
> SheetJS CE không hỗ trợ cell styling (màu nền, border, bold).
>
> **Hai lựa chọn:**
> - `sheetjs-style` (fork nhẹ, có cell styling cơ bản) — khuyến nghị
> - `exceljs` (~5MB, đầy đủ tính năng nhất) — dùng khi cần styling phức tạp
>
> Với Vercel Serverless cả hai đều chạy được. Vercel Hobby nên dùng
> `sheetjs-style` để tránh cold start chậm.

---

## 🔑 8. Admin Panel Config

### Keys trong Vercel KV
skill:feature-track:prompt ← System prompt (editable qua UI)
skill:feature-track:template_url ← URL file template .xlsx trên Blob
skill:feature-track:columns:roadmap ← Danh sách cột + thứ tự ROADMAP sheet
skill:feature-track:columns:backlog ← Danh sách cột BACKLOG sheet
skill:feature-track:themes ← Color presets theo dự án
skill:feature-track:effort-mapping ← XS=1pt, S=2pt... (thay được)
skill:feature-track:status-flow ← Allowed transitions
skill:feature-track:versions ← Version history (max 10 entries)

text

### Config thay được không cần deploy

| Config Key | Thay đổi được gì | Ví dụ thực tế |
|---|---|---|
| `columns:roadmap` | Thêm/bớt/đổi tên cột | Thêm cột "Đơn vị yêu cầu" |
| `columns:backlog` | Thêm trường tracking | Thêm cột "Phiên bản tối thiểu" |
| `effort-mapping` | Thay story point values | L=8pt thay vì 5pt |
| `status-flow` | Cho phép skip status | Backlog → Done trực tiếp |
| `themes` | Màu sắc theo dự án | Mỗi dự án 1 màu chủ đạo |
| `prompt` | Tuỳ chỉnh AI behavior | Thêm rule đặc thù dự án |

---

## 🔗 9. Tích hợp với các Skill khác
┌─────────────────────────────────────────────────────────┐
│ FEATURE TRACK (SKILL-7) │
│ │
│ features[] ──→ SKILL-2 PPTX │
│ Tự động tạo slide tiến độ cho họp │
│ │
│ roadmap data ──→ SKILL-3 EXCEL │
│ Báo giá theo feature package │
│ │
│ Done items ──→ SKILL-5 BUG & RELEASE │
│ Release note đầy đủ Bug + Feature │
│ │
│ techSpecUrl ←── SKILL-6 TRANSFER KN │
│ Link tài liệu kỹ thuật từng feature │
└─────────────────────────────────────────────────────────┘

text

**Flow tích hợp điển hình (cuối sprint):**
1. SKILL-7 → sinh Excel báo cáo sprint + RELEASE_NOTES draft
2. SKILL-5 → lấy danh sách bug đã fix, merge vào release note
3. SKILL-2 → sinh slide báo cáo sprint cho họp review
4. SKILL-6 → export tài liệu bàn giao kỹ thuật cho version mới

---