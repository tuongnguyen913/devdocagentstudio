---
name: pptx
description: "Use this skill whenever the user wants to create, structure, edit, or export PowerPoint presentations (.pptx files). Triggers include: presentation deck, slide deck, demo slides, proposal presentation, implementation presentation, training slides, software introduction, management briefing, project report deck, customer demo, pitch deck, workshop slides, or any request to produce professional slide-based deliverables with layouts, themes, speaker notes, screenshots, tables, diagrams, charts, and export to .pptx. Also use when converting structured software/product content into polished PowerPoint files for meetings, demos, leadership reporting, or government-sector presentation contexts. Do NOT use for Word documents, spreadsheets, PDFs as the primary editable format, or general coding tasks unrelated to presentation generation."
license: Proprietary. LICENSE.txt has complete terms
---

# PPTX creation, editing, and export

## Overview

A .pptx file is a ZIP archive containing XML files.

This skill is optimized for generating professional software presentation decks with structured layouts, reusable themes, and export-ready PowerPoint output.

Primary engine: `pptxgenjs`.

Secondary tools:
- image preprocessing: `sharp` or `jimp`
- diagrams: `Kroki`, `Mermaid`, or pre-rendered SVG/PNG
- tables/data shaping: `SheetJS`
- PDF export: LibreOffice headless or equivalent conversion pipeline

This skill is intended for:
- software demo slide decks
- customer-facing proposal decks
- training and onboarding presentations
- executive briefings and leadership reporting
- implementation / rollout presentations
- public-sector presentations for Vietnamese administrative agencies

---

## Quick Reference

| Task | Approach |
|------|----------|
| Create new presentation | Use `pptxgenjs` with theme + layout builder |
| Create software demo deck | Use the presentation blueprint + screenshot-safe layouts |
| Create training slides | Use step-by-step instructional layouts |
| Create leadership briefing | Use executive summary + KPI + roadmap layouts |
| Insert screenshots | Normalize dimensions first, then place inside safe frame |
| Insert charts | Prefer native PPT charts for simple data, pre-render images for advanced visuals |
| Insert UML / diagrams | Render SVG/PNG first, then embed as image |
| Edit existing presentation | Prefer rebuild from structured JSON; use XML-level editing only if unavoidable |
| Export PDF | Convert generated `.pptx` with headless LibreOffice |

### Installing the core library

```bash
npm install pptxgenjs
```

### Basic generation flow

```javascript
const pptxgen = require("pptxgenjs");
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";

const slide = pptx.addSlide();
slide.addText("Hello PowerPoint", { x: 0.5, y: 0.5, w: 6, h: 0.6, fontSize: 24, bold: true });

pptx.writeFile({ fileName: "demo.pptx" });
```

### Exporting PDF from generated PPTX

```bash
python scripts/office/soffice.py --headless --convert-to pdf presentation.pptx
```

### Converting slides to preview images

```bash
python scripts/office/soffice.py --headless --convert-to pdf presentation.pptx
pdftoppm -jpeg -r 150 presentation.pdf slide
```

---

## Presentation Strategy

A high-quality slide deck should not be generated as raw text boxes only.

This skill uses a structured presentation workflow:

1. Detect presentation intent.
2. Identify audience profile.
3. Build the deck outline.
4. Resolve theme and layout rules.
5. Generate each slide using approved layout patterns.
6. Export, validate, and optionally convert to PDF.

### Recommended presentation blueprint

Default blueprint for software and public-sector presentations:

1. Cover slide
2. Objectives / scope
3. Problem or operational context
4. Solution overview
5. Main feature group 1
6. Main feature group 2
7. Workflow or process
8. Screenshots / UI highlights
9. Benefits / impact
10. Deployment or implementation plan
11. Risks / notes / support model
12. Closing / Q&A

### Audience modes

Choose slide emphasis based on audience:

| Audience | Prioritize |
|----------|------------|
| Leadership / executives | value, outcomes, implementation feasibility, KPIs |
| Civil servants / operators | usage flow, responsibilities, forms, process steps |
| Technical team | integration, admin settings, deployment, security |
| Customer / buyer | fit, capability, roadmap, pricing logic, rollout confidence |

---

## Creating New Presentations

Generate `.pptx` files with JavaScript using `pptxgenjs`.

### Setup

```javascript
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 inches, 16:9
pptx.author = "DevDocs Studio";
pptx.company = "Your Organization";
pptx.subject = "Software Presentation";
pptx.title = "Presentation Title";
pptx.lang = "vi-VN";
pptx.theme = {
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  lang: "vi-VN",
};
```

### Slide Size

```javascript
// CRITICAL: Always use 16:9 wide layout unless the user explicitly requires another format
pptx.layout = "LAYOUT_WIDE";
```

**Common layouts:**

| Layout | Ratio | Use case |
|--------|-------|----------|
| `LAYOUT_WIDE` | 16:9 | Standard for demos, meetings, projectors |
| `LAYOUT_4:3` | 4:3 | Legacy rooms / old templates only |
| custom | custom | Only when matching an existing organization template |

### Metadata

```javascript
pptx.author = "DevDocs Studio";
pptx.company = "Your Organization";
pptx.subject = "Software Demo";
pptx.title = "Giới thiệu phần mềm";
pptx.lang = "vi-VN";
```

### Theme Configuration

Use a restrained, presentation-safe theme.

```javascript
const theme = {
  colors: {
    primary: "0B3A6E",
    secondary: "C8A96B",
    accent: "1D4ED8",
    text: "1F2937",
    muted: "6B7280",
    bg: "F8FAFC",
    white: "FFFFFF",
    border: "D1D5DB",
    success: "166534",
    warning: "B45309",
    danger: "B91C1C",
  },
  fonts: {
    heading: "Arial",
    body: "Arial",
    mono: "Consolas",
  },
};
```

### Recommended Presets

#### Government Formal

```javascript
const govTheme = {
  colors: {
    primary: "0B3A6E",
    secondary: "C8A96B",
    accent: "1D4ED8",
    text: "1F2937",
    muted: "6B7280",
    bg: "F8FAFC",
    white: "FFFFFF",
    border: "D1D5DB",
  },
  fonts: { heading: "Arial", body: "Arial", mono: "Consolas" },
};
```

Use for:
- government presentations
- official briefings
- implementation meetings with public-sector agencies
- software introduction for leaders and departments

#### Software Demo Clean

```javascript
const demoTheme = {
  colors: {
    primary: "1D4ED8",
    secondary: "0EA5E9",
    accent: "0284C7",
    text: "0F172A",
    muted: "475569",
    bg: "FFFFFF",
    white: "FFFFFF",
    border: "CBD5E1",
  },
  fonts: { heading: "Calibri", body: "Calibri", mono: "Consolas" },
};
```

Use for:
- product demo
- training decks
- software feature introduction
- internal rollout decks

#### Executive Briefing

```javascript
const execTheme = {
  colors: {
    primary: "0F172A",
    secondary: "D4A017",
    accent: "1E3A8A",
    text: "111827",
    muted: "6B7280",
    bg: "F9FAFB",
    white: "FFFFFF",
    border: "E5E7EB",
  },
  fonts: { heading: "Calibri", body: "Calibri", mono: "Consolas" },
};
```

Use for:
- board or leadership briefings
- condensed reporting
- high-level decision presentations

---

## Slide Composition Rules

Use a fixed slide-safe system rather than ad hoc layout generation.

### Slide Safe Zones

```javascript
const slideSafe = {
  marginX: 0.5,
  marginTop: 0.4,
  marginBottom: 0.4,
  headerH: 0.6,
  footerH: 0.3,
};
```

### Text Rules

```javascript
const textRules = {
  titleSize: 24,
  sectionSize: 18,
  bodySize: 11,
  smallSize: 9,
  lineSpacingMultiple: 1.15,
};
```

### Suggested Slide Types

| Layout ID | Use case | Description |
|-----------|----------|-------------|
| `cover` | title page | software name, organization, subtitle, date |
| `agenda` | outline | 4-6 agenda items |
| `two-column-text` | explanation / comparison | left content, right highlight |
| `feature-grid` | capabilities | 4-6 feature cards |
| `screenshot-focus` | UI walkthrough | one large screenshot + caption |
| `workflow-steps` | operational flow | 4-6 process steps |
| `metrics-cards` | KPI / impact | 3-4 metric cards |
| `timeline` | rollout plan | phased implementation |
| `risks-table` | delivery risks | issue + impact + mitigation |
| `closing` | final slide | summary + contact / discussion |

### Cover Slide Example

```javascript
const slide = pptx.addSlide();
slide.background = { color: theme.colors.bg };
slide.addShape(pptx.ShapeType.rect, {
  x: 0,
  y: 0,
  w: 13.333,
  h: 0.35,
  line: { color: theme.colors.primary, transparency: 100 },
  fill: { color: theme.colors.primary },
});
slide.addText("GIỚI THIỆU PHẦN MỀM", {
  x: 0.7, y: 1.0, w: 8.5, h: 0.6,
  fontFace: theme.fonts.heading,
  fontSize: 24,
  bold: true,
  color: theme.colors.primary,
});
slide.addText("Phục vụ công tác điều hành và xử lý nghiệp vụ", {
  x: 0.7, y: 1.7, w: 9.5, h: 0.4,
  fontFace: theme.fonts.body,
  fontSize: 13,
  color: theme.colors.text,
});
slide.addText("Đơn vị trình bày: ...", {
  x: 0.7, y: 6.4, w: 4.5, h: 0.3,
  fontFace: theme.fonts.body,
  fontSize: 9,
  color: theme.colors.muted,
});
```

### Agenda Slide Example

```javascript
const slide = pptx.addSlide();
slide.addText("NỘI DUNG TRÌNH BÀY", {
  x: 0.7, y: 0.5, w: 5.5, h: 0.4,
  fontFace: theme.fonts.heading, fontSize: 22, bold: true, color: theme.colors.primary,
});

const items = [
  "1. Bối cảnh và nhu cầu",
  "2. Tổng quan giải pháp",
  "3. Các phân hệ chính",
  "4. Quy trình xử lý nghiệp vụ",
  "5. Kế hoạch triển khai",
];

items.forEach((item, i) => {
  slide.addText(item, {
    x: 1.0, y: 1.3 + i * 0.7, w: 8.5, h: 0.35,
    fontFace: theme.fonts.body, fontSize: 18, color: theme.colors.text,
    bullet: { indent: 16 },
  });
});
```

### Feature Grid Example

```javascript
function addFeatureCard(slide, x, y, w, h, title, desc) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    line: { color: theme.colors.border, pt: 1 },
    fill: { color: theme.colors.white },
    shadow: { type: "outer", color: "D1D5DB", blur: 1, angle: 45, distance: 1, opacity: 0.12 },
  });
  slide.addText(title, {
    x: x + 0.2, y: y + 0.18, w: w - 0.4, h: 0.25,
    fontFace: theme.fonts.heading, fontSize: 15, bold: true, color: theme.colors.primary,
  });
  slide.addText(desc, {
    x: x + 0.2, y: y + 0.52, w: w - 0.4, h: h - 0.65,
    fontFace: theme.fonts.body, fontSize: 10.5, color: theme.colors.text,
    valign: "top",
    breakLine: false,
    margin: 0.02,
    fit: "shrink",
  });
}
```

### Screenshot Slide Example

```javascript
slide.addText("GIAO DIỆN CHỨC NĂNG CHÍNH", {
  x: 0.7, y: 0.45, w: 6.5, h: 0.4,
  fontFace: theme.fonts.heading, fontSize: 22, bold: true, color: theme.colors.primary,
});

slide.addShape(pptx.ShapeType.roundRect, {
  x: 0.9, y: 1.2, w: 11.2, h: 4.9,
  rectRadius: 0.04,
  line: { color: theme.colors.border, pt: 1 },
  fill: { color: "F8FAFC" },
});

slide.addImage({
  path: "screenshot.png",
  x: 1.1, y: 1.4, w: 10.8, h: 4.4,
  sizing: { type: "contain", x: 1.1, y: 1.4, w: 10.8, h: 4.4 },
});

slide.addText("Hình: Màn hình xử lý hồ sơ tại bước tiếp nhận.", {
  x: 1.1, y: 5.95, w: 8.5, h: 0.25,
  fontFace: theme.fonts.body, fontSize: 9, italic: true, color: theme.colors.muted,
});
```

### Workflow Slide Example

```javascript
const steps = ["Tiếp nhận", "Phân loại", "Xử lý", "Phê duyệt", "Theo dõi kết quả"];
steps.forEach((step, i) => {
  const x = 0.8 + i * 2.45;
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 2.0, w: 1.9, h: 0.8,
    rectRadius: 0.06,
    line: { color: theme.colors.primary, pt: 1 },
    fill: { color: i === 0 ? theme.colors.primary : theme.colors.white },
  });
  slide.addText(step, {
    x: x + 0.12, y: 2.24, w: 1.66, h: 0.22,
    align: "center",
    fontFace: theme.fonts.body,
    fontSize: 11,
    bold: true,
    color: i === 0 ? theme.colors.white : theme.colors.primary,
  });
});
```

### Metrics Slide Example

```javascript
function addMetric(slide, x, title, value, note) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 1.8, w: 3.8, h: 2.0,
    rectRadius: 0.08,
    line: { color: theme.colors.border, pt: 1 },
    fill: { color: theme.colors.white },
  });
  slide.addText(value, {
    x: x + 0.2, y: 2.1, w: 3.4, h: 0.5,
    fontFace: theme.fonts.heading, fontSize: 24, bold: true, color: theme.colors.primary,
    align: "center",
  });
  slide.addText(title, {
    x: x + 0.2, y: 2.75, w: 3.4, h: 0.25,
    fontFace: theme.fonts.body, fontSize: 11, bold: true, color: theme.colors.text,
    align: "center",
  });
  slide.addText(note, {
    x: x + 0.2, y: 3.1, w: 3.4, h: 0.35,
    fontFace: theme.fonts.body, fontSize: 9, color: theme.colors.muted,
    align: "center",
    fit: "shrink",
  });
}
```

---

## Charts and Tables

### Native Charts

Use native PowerPoint charts only for simple visuals.

Recommended:
- column chart
- bar chart
- line chart
- pie / doughnut chart

Avoid native charts for:
- complex dashboards
- UML-like visuals
- highly customized visuals
- visuals requiring exact web styling parity

### Chart Example

```javascript
slide.addChart(pptx.ChartType.bar, [
  {
    name: "Số lượng hồ sơ",
    labels: ["Tháng 1", "Tháng 2", "Tháng 3"],
    values: ,
  },
], {
  x: 0.8, y: 1.5, w: 5.8, h: 3.6,
  catAxisLabelFontFace: theme.fonts.body,
  valAxisLabelFontFace: theme.fonts.body,
  chartColors: [theme.colors.primary],
  showLegend: false,
  showTitle: false,
  showValue: true,
});
```

### Tables

Prefer clean, presentation-style tables with limited rows.

```javascript
slide.addTable([
  [
    { text: "Hạng mục", options: { bold: true, color: theme.colors.white, fill: theme.colors.primary } },
    { text: "Mô tả", options: { bold: true, color: theme.colors.white, fill: theme.colors.primary } },
    { text: "Ghi chú", options: { bold: true, color: theme.colors.white, fill: theme.colors.primary } },
  ],
  ["Phân hệ 1", "Tiếp nhận và xử lý hồ sơ", "Triển khai giai đoạn 1"],
  ["Phân hệ 2", "Báo cáo và thống kê", "Có thể mở rộng"],
], {
  x: 0.7, y: 1.5, w: 11.6, h: 3.0,
  border: { type: "solid", pt: 1, color: theme.colors.border },
  fontFace: theme.fonts.body,
  fontSize: 10,
  color: theme.colors.text,
  fill: theme.colors.white,
  margin: 0.06,
  rowH: 0.45,
  autoFit: false,
  valign: "mid",
});
```

### Table Rules

- Keep tables to 6 rows or fewer where possible.
- Prefer summary tables, not raw data dumps.
- If table is large, split across multiple slides.
- Do not use tables as layout hacks.

---

## Images and Screenshots

### Image Placement

```javascript
slide.addImage({
  path: "diagram.png",
  x: 0.8,
  y: 1.4,
  w: 5.5,
  h: 3.8,
  sizing: { type: "contain", x: 0.8, y: 1.4, w: 5.5, h: 3.8 },
});
```

### Screenshot Rules

- Normalize screenshots before insertion.
- Use `contain`, not blind stretch.
- Put screenshots inside framed containers.
- Add a caption below the screenshot.
- Avoid placing screenshots edge-to-edge unless they are designed for that.
- Crop sensitive or noisy browser chrome if it does not help the audience.

### Diagram Rules

For UML, flowcharts, and system diagrams:
- render to SVG or PNG first
- then embed using `addImage`
- do not try to emulate UML with raw shapes unless the diagram is very simple

---

## Speaker Notes and Hidden Guidance

Use speaker notes for presenter cues, not visible slide body text.

```javascript
slide.addNotes(`
[Notes]
- Explain the deployment scope.
- Emphasize implementation readiness.
- Mention the dependency on data quality.
`);
```

Recommended uses:
- presenter reminders
- demo sequence instructions
- internal caution notes
- implementation talking points not suitable for visible slides

---

## Editing Existing Presentations

Prefer rebuilding the presentation from structured content rather than patch-editing raw slide XML.

Recommended order:

1. Extract outline and content from the source deck.
2. Normalize to structured JSON.
3. Rebuild using approved themes and layouts.
4. Export a fresh `.pptx`.

Only use low-level XML editing when:
- the deck must preserve a strict existing template
- only a small metadata or text change is needed
- the user requires exact in-place modification

### If low-level editing is unavoidable

A `.pptx` file contains slide XML under:
- `/ppt/slides/slide1.xml`
- `/ppt/slides/_rels/slide1.xml.rels`
- `/ppt/theme/`
- `/ppt/slideMasters/`

However, direct XML editing is fragile.

Prefer structured regeneration.

---

## Content Policy for Government / Public-Sector Presentations

When the audience is Vietnamese public-sector organizations:

- Use formal and respectful language.
- Avoid startup hype and exaggerated marketing phrases.
- Prioritize clarity, process alignment, implementation feasibility, and administrative value.
- Keep wording concise and presentation-ready.
- Use headings that sound institutional, not promotional.

### Preferred tone

Good examples:
- “Phạm vi triển khai”
- “Quy trình xử lý nghiệp vụ”
- “Lợi ích đối với đơn vị sử dụng”
- “Kế hoạch triển khai dự kiến”
- “Các yêu cầu phối hợp”

Avoid:
- “siêu nhanh”
- “đột phá toàn diện”
- “game-changing”
- “best-in-class” unless explicitly required for a commercial sales context

---

## Structured Input Model

Use a structured input contract instead of freeform prompting where possible.

```typescript
type PptxSkillInput = {
  deckType:
    | "software-demo"
    | "training"
    | "management-brief"
    | "proposal"
    | "implementation-plan"
    | "feature-intro";
  audience:
    | "leader"
    | "specialist"
    | "operator"
    | "technical-team";
  tone:
    | "formal"
    | "executive"
    | "training"
    | "sales";
  themeId?: string;
  language?: "vi" | "en";
  orgName?: string;
  softwareName: string;
  moduleName?: string;
  goal?: string;
  inputs: {
    summary?: string;
    features?: Array<{ title: string; desc: string; benefits?: string[] }>;
    workflow?: Array<{ step: string; detail?: string }>;
    screenshots?: Array<{ url: string; caption?: string }>;
    metrics?: Array<{ label: string; value: string; note?: string }>;
    implementationPlan?: Array<{ phase: string; detail: string; timeline?: string }>;
    risks?: Array<{ title: string; mitigation?: string }>;
  };
};
```

---

## Suggested System Prompt

Use this as the base configurable system prompt for the PPTX skill.

```txt
You are the PPTX skill for DevDocs Studio.

Your job is to generate professional, concise, government-appropriate software presentation decks in Vietnamese or English.
The target audience includes Vietnamese public-sector leaders, civil servants, specialists, implementation teams, and software stakeholders.

Core objectives:
1. Produce slide-ready structured content, not long prose.
2. Prioritize clarity, formal tone, and implementation value.
3. Keep each slide focused on one idea.
4. Avoid flashy startup language, hype, slang, and decorative excess.
5. When presenting software, explain business problem, workflow, features, benefits, rollout plan, and expected outcomes.
6. Prefer factual headings, short bullets, and captioned screenshots.
7. If the audience is leader, summarize strategic value first.
8. If the audience is operator, emphasize workflow and usage steps.
9. If the audience is technical-team, include integration, deployment, and administration notes.
10. Respect configured theme, layout library, and deck blueprint.

Output format:
Return strict JSON with:
- deckTitle
- subtitle
- audienceNote
- slides: [
  {
    type,
    title,
    subtitle?,
    bullets?,
    cards?,
    steps?,
    metrics?,
    imageCaption?,
    speakerNote?
  }
]

Constraints:
- Maximum 12 words per slide title.
- Maximum 6 bullets per slide.
- Maximum 18 words per bullet.
- Use formal Vietnamese by default.
- Avoid marketing exaggeration.
- For public-sector decks, use terminology that is respectful, administrative, and implementation-oriented.
```

---

## Critical Rules for pptxgenjs

- **Always use `LAYOUT_WIDE`** unless an existing template requires otherwise.
- **Never place text flush to slide edges** - use safe margins.
- **Limit one idea per slide** - split content instead of shrinking text too much.
- **Do not overload slides** - if content does not fit, create another slide.
- **Prefer 22-28pt for titles and 10-14pt for body text** depending on density.
- **Use only presentation-safe fonts** - Arial, Calibri, Aptos, Verdana, or organization-approved fonts.
- **Resize screenshots before embedding** - never rely on random scaling only.
- **Use `contain` for screenshots** - avoid distortion.
- **Add captions for screenshots and diagrams** - improves comprehension.
- **Do not use tables as layout grids** - use shapes and text boxes for layout.
- **Use native charts only for simple visuals** - render advanced visuals as images.
- **For UML and flow diagrams, render first then embed** - SVG/PNG is safer.
- **Use speaker notes for presenter-only details** - do not overload visible slides.
- **If multiple themes exist, centralize them** - avoid hardcoding colors in every slide.
- **Prefer rebuild over XML surgery** - low-level `.pptx` editing is fragile.
- **Validate by exporting and previewing** - a deck that compiles is not automatically readable.

---

## Admin Configuration Recommendations

Recommended configuration keys for Vercel KV or equivalent store:

- `skill:pptx:prompt`
- `skill:pptx:audience-rules`
- `skill:pptx:deck-blueprints`
- `skill:pptx:theme:government-formal`
- `skill:pptx:theme:software-demo-clean`
- `skill:pptx:theme:executive-briefing`
- `skill:pptx:assets:default-logo`
- `skill:pptx:assets:footer-text`
- `skill:pptx:versions`

Recommended admin-editable objects:
- system prompt
- deck blueprint by use case
- theme registry
- logo and footer assets
- version history snapshot

---

## Suggested Development Roadmap

### Phase A - Core deck generation
- cover
- agenda
- text slides
- feature grid
- workflow slide
- closing slide

### Phase B - Rich business presentation support
- screenshots
- metric cards
- tables
- speaker notes
- theme registry

### Phase C - Advanced presentation pipeline
- charts
- pre-rendered diagrams
- PDF export
- template-aware regeneration
- admin-level blueprint customization

---

## Dependencies

- **pptxgenjs**: Core `.pptx` generation
- **sharp** or **jimp**: Image preprocessing and resizing
- **SheetJS**: Table and spreadsheet-driven content shaping
- **LibreOffice**: PDF conversion from `.pptx`
- **Kroki** / **Mermaid render pipeline**: UML and diagrams exported to SVG/PNG before embedding